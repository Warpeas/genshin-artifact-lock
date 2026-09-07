#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
通过 GitHub API 推送变更到远程仓库。

为什么不用 git push：
    某些网络环境（如受限沙箱）会拦截 github.com 的 git 端点 TLS 握手
    （gnutls_handshake failed），但 api.github.com 的 REST 接口通常仍可用。
    本脚本走 Git Data API，用一次提交（单个 commit）推送所有变更文件。

用法：
    python3 push.py                  # 提交信息默认 "更新内容"
    python3 push.py "修复某某问题"    # 自定义提交信息

依赖：
    - gh CLI 且已登录（gh auth status 有输出即可）
    - 大文件（如图片）走 base64，单文件建议 < 100MB
"""
import base64
import hashlib
import json
import os
import socket
import subprocess
import sys
import tempfile

REPO = "Warpeas/genshin-artifact-lock"
BRANCH = "master"

# 需要跟踪的文件（相对项目根目录）
TRACKED_FILES = [
    ".nojekyll",
    "README.md",
    "build.js",
    "push.py",
    "index.html",
    "preview/01-角色配置.png",
    "preview/02-锁定方案.png",
    "preview/03-副词条规则.png",
    "src/app.js",
    "src/data.js",
    "src/styles.css",
    "src/template.html",
]

ROOT = os.path.dirname(os.path.abspath(__file__))


def gh(*args):
    """调用 gh api，返回解析后的 JSON；出错时抛出带 stderr 的异常。"""
    proc = subprocess.run(
        ["gh", "api"] + list(args),
        capture_output=True, text=True, cwd=ROOT,
    )
    if proc.returncode != 0:
        raise RuntimeError(f"gh api 调用失败: {' '.join(args)}\n{proc.stderr.strip()}")
    out = proc.stdout.strip()
    return json_loads(out) if out else None


def json_loads(s):
    import json
    return json.loads(s)


def git_blob_sha(path):
    """计算文件对应的 git blob sha1（与 git hash-object 一致）。"""
    with open(path, "rb") as f:
        data = f.read()
    h = hashlib.sha1()
    h.update(b"blob %d\0" % len(data))
    h.update(data)
    return h.hexdigest()


def remote_tree():
    """获取远程分支上所有 blob 的 path -> sha 映射。"""
    tree = gh(f"repos/{REPO}/git/trees/{BRANCH}?recursive=1")
    return {
        item["path"]: item["sha"]
        for item in tree.get("tree", [])
        if item.get("type") == "blob"
    }


def check_dns():
    """部分网络环境会把 GitHub 域名解析到保留地址段（DNS 污染），提前给出修复提示。"""
    try:
        ip = socket.gethostbyname("api.github.com")
    except Exception:
        return
    if ip.startswith("198.18.") or ip.startswith("0."):
        print(f"⚠ 检测到 DNS 污染：api.github.com 解析到 {ip}（保留地址，无法连接）")
        print("  修复方法：把 DNSPod 查到的真实 IP 写进 /etc/hosts")
        print("    curl -s 'http://119.29.29.29/d?dn=api.github.com'")
        print("    curl -s 'http://119.29.29.29/d?dn=github.com'")
        print("    echo '<真实IP> api.github.com' | sudo tee -a /etc/hosts")
        sys.exit(1)


def main():
    message = sys.argv[1] if len(sys.argv) > 1 else "更新内容"
    os.chdir(ROOT)
    check_dns()

    # 1. 找出与远程不一致的文件
    remote = remote_tree()
    changed = []
    for rel in TRACKED_FILES:
        if not os.path.isfile(rel):
            print(f"  ! 跳过（本地不存在）: {rel}")
            continue
        if remote.get(rel) != git_blob_sha(rel):
            changed.append(rel)

    if not changed:
        print("✓ 本地与远程完全一致，无需推送")
        return 0

    print(f"检测到 {len(changed)} 个文件变更：")
    for rel in changed:
        print(f"  - {rel}")

    # 2. 为每个变更文件创建 blob
    tree_entries = []
    for rel in changed:
        with open(rel, "rb") as f:
            content = base64.b64encode(f.read()).decode("ascii")
        blob = gh(
            "-X", "POST", f"repos/{REPO}/git/blobs",
            "-f", f"content={content}",
            "-f", "encoding=base64",
        )
        tree_entries.append((rel, blob["sha"]))
        print(f"  ↑ blob 已创建: {rel}")

    # 3. 基于远程当前 tree 创建新 tree
    #    坑：/git/trees/<branch> 返回的 sha 其实是 commit sha，
    #    真正的 tree sha 必须从 commit 对象的 tree.sha 取，否则会 422 Invalid tree info
    parent = gh(f"repos/{REPO}/git/refs/heads/{BRANCH}")["object"]["sha"]
    base_sha = gh(f"repos/{REPO}/git/commits/{parent}")["tree"]["sha"]
    #    tree 是数组，gh 的 -f 语法无法表达，必须用 --input 传真正的 JSON
    payload = {
        "base_tree": base_sha,
        "tree": [
            {"path": p, "mode": "100644", "type": "blob", "sha": s}
            for p, s in tree_entries
        ],
    }
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False,
                                     encoding="utf-8") as tf:
        json.dump(payload, tf)
        tmp_path = tf.name
    try:
        new_tree = gh("-X", "POST", f"repos/{REPO}/git/trees", "--input", tmp_path)
    finally:
        os.unlink(tmp_path)

    # 4. 创建 commit，父提交为当前分支头（parent 已在第 3 步取得）
    commit = gh(
        "-X", "POST", f"repos/{REPO}/git/commits",
        "-f", f"message={message}",
        "-f", f"tree={new_tree['sha']}",
        "-f", f"parents[]={parent}",
    )

    # 5. 更新分支引用
    gh(
        "-X", "PATCH", f"repos/{REPO}/git/refs/heads/{BRANCH}",
        "-f", f"sha={commit['sha']}",
    )

    print(f"\n✓ 推送完成：{commit['sha'][:8]}  “{message}”")
    print(f"  https://github.com/{REPO}/commit/{commit['sha'][:8]}")
    print(f"  Pages 约 1 分钟后更新：https://warpeas.github.io/genshin-artifact-lock/")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as e:
        print(f"✗ 推送失败：{e}", file=sys.stderr)
        sys.exit(1)
