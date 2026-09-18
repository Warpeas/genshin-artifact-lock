#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""tools/rebuild_data.py —— 配装数据「一条命令重建」总入口

把 wiki 抓取 → 解析复核 → 回写 src/data.js → 数据自检 → 打包 index.html
串成一条链，保证以后**只跑 tools 里的脚本**就能重建出正确的配装数据。

用法::

    python tools/rebuild_data.py              # 默认：联网抓 125 角色 → 复核 → 回写 → 自检 → 打包
    python tools/rebuild_data.py --offline    # 不联网：直接拿 out/wiki_builds.json 快照重放
    python tools/rebuild_data.py --dry        # 只预览（不写 src/data.js）
    python tools/rebuild_data.py --no-build   # 跳过 node build.js
    python tools/rebuild_data.py 胡桃 钟离      # 只重建指定角色（联网时生效）

设计要点：

* **wiki 不可达不影响正确性**：抓取失败的角色一律保留快照旧数据，
  抓完全 0 成功会自动提示并继续走离线复核；`--offline` 则完全基于快照重放，
  两条路走的是同一套 `STAT_ALIAS` + `parse_fields()`，结果一致。
* **不允许静默丢词条**：抓取后强制跑一次 `--reparse` 复核，出现未识别片段
  直接以退出码 2 中止（除非显式 `--allow-unrecognized`）。
* 自检不通过（死字段 / roles 为空 / 未识别片段 / optional 异常）时退出码非 0。
"""
import os
import re
import subprocess
import sys

TOOLS = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(TOOLS)
OUT = os.path.join(TOOLS, "out")


def run(cmd, title):
    print("\n" + "=" * 72)
    print(">>> " + title)
    print("    " + " ".join(cmd))
    print("=" * 72)
    p = subprocess.run(cmd, cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    out = p.stdout.decode("utf-8", "replace")
    print(out.rstrip())
    return p.returncode, out


def main():
    args = sys.argv[1:]
    flags = {a for a in args if a.startswith("--")}
    targets = [a for a in args if not a.startswith("--")]
    offline = bool(flags & {"--offline", "--skip-fetch"})
    dry = "--dry" in flags
    py = sys.executable or "python"

    if not offline:
        cmd = [py, os.path.join(TOOLS, "fetch_wiki_builds.py")] + targets
        if "--allow-unrecognized" in flags:
            cmd.append("--allow-unrecognized")
        rc, out = run(cmd, "1/6 联网抓取 wiki 配装（抓后自动走同一套解析复核）")
        if rc != 0:
            print("\n[提示] 联网抓取未正常结束（退出码 %s）。" % rc)
            print("       若 wiki 不可达，可改用：python tools/rebuild_data.py --offline")
            print("       本次继续尝试用 out/wiki_builds.json 快照重放，数据不会更差。")
            rc2, _ = run([py, os.path.join(TOOLS, "fetch_wiki_builds.py"), "--reparse"] +
                         (["--allow-unrecognized"] if "--allow-unrecognized" in flags else []),
                         "1b/6 快照离线重放（兜底）")
            if rc2 != 0:
                print("\n[中止] 快照重放也失败，未能产出可用数据。请先修 STAT_ALIAS / 网络。")
                return rc2
    else:
        rc, _ = run([py, os.path.join(TOOLS, "fetch_wiki_builds.py"), "--reparse"] +
                    (["--allow-unrecognized"] if "--allow-unrecognized" in flags else []),
                    "1/6 离线快照重放（不联网）")
        if rc != 0:
            print("\n[中止] 快照重放失败（多半是别名表覆盖不全，未识别片段被拦下）。")
            return rc

    step = 2
    apply_cmd = [py, os.path.join(TOOLS, "apply_wiki_builds.py"), "--no-links"]
    if not dry:
        apply_cmd.append("--apply")
    rc, out = run(apply_cmd, "%d/6 回写 src/data.js%s" % (step, "（预览）" if dry else ""))
    if rc != 0:
        return rc
    if dry:
        print("\n--dry 结束：未写回 src/data.js，未做自检与打包。")
        return 0

    rc, _ = run([py, os.path.join(TOOLS, "test_parse.py")], "3/6 解析回归测试 test_parse.py")
    if rc != 0:
        print("\n[中止] 解析回归测试未通过，请勿使用当前数据。")
        return rc

    rc, out = run(["node", os.path.join(TOOLS, "check_data.js")], "4/6 数据自检 check_data.js")
    check_rc = rc
    m = re.search(r"required 死字段[^:]*:\s*(\d+)", out)
    n = re.search(r"roles（功能定位）为空:\s*(\d+)", out)
    u = re.search(r"未识别片段:\s*(\d+)", out)
    s = re.search(r"★必选为空的组[^:]*:\s*(\d+)", out)
    o = re.search(r"optional（wiki 条件词条）异常:\s*(\d+)", out)

    if "--no-build" not in flags:
        rc, _ = run(["node", "build.js"], "5/6 打包 index.html")
        if rc != 0:
            return rc
    else:
        print("\n[跳过] 5/6 打包（--no-build）")

    print("\n" + "=" * 72)
    print(">>> 6/6 本次重建结果")
    print("=" * 72)
    print("抓取/解析来源 : %s" % ("离线快照重放 out/wiki_builds.json" if offline else "wiki 在线抓取 + 同一套解析复核"))
    print("死字段        : %s" % (m.group(1) if m else "?"))
    print("空定位 roles  : %s" % (n.group(1) if n else "?"))
    print("未识别片段    : %s" % (u.group(1) if u else "?"))
    print("optional 异常 : %s" % (o.group(1) if o else "?"))
    print("★必选为空组数 : %s（无 ★ 约束的组，属正常分布）" % (s.group(1) if s else "?"))
    print("自检退出码    : %s" % check_rc)
    print("明细见 tools/out/_scan_result.md、tools/out/parse_warnings.json")
    return check_rc


if __name__ == "__main__":
    sys.exit(main())
