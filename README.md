# 营养日记

面向两人家庭的移动端每周果蔬饮与固定早餐计划。

Live: https://shockw4ver.github.io/

## 当前功能
- 每周七天两人份果蔬搅拌饮配方
- 固定高蛋白早餐和晨间流程
- 周日采购、周三补货清单，可勾选并保存在本机
- 历史周次数据结构
- iPhone Safari 添加到主屏幕（PWA）及基础离线缓存

## 更新计划
将新一周计划写入 `data/weeks.json`，并把 `currentWeek` 指向新周。Service Worker 会优先刷新周计划数据。

## 部署
GitHub Pages 从 master 分支根目录发布。
