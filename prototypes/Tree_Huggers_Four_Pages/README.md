# Tree Huggers — 四页故事

## 打开和展示

解压整个文件夹后双击根目录 `index.html`。不需要安装依赖、不需要联网，不要只把 index.html 单独移出文件夹。

如果使用单文件 `Tree_Huggers_Four_Pages.html`，直接双击即可，所有图片、地图、数据和字体均已内嵌。

四页顺序：

1. Atlanta / City in the Forest 封面。
2. 四个原始剪纸气泡介绍；使用确认存在的 433 个网格，不填入未经确认的百分比和树木总数。
3. 原始 “But what happens when we look closer?” 文字、箭头和问号。
4. 真实树冠网格地图。

可以滚动浏览，也可以点前三幕底部按钮推进，或点右上角页码跳转。第四页左上角项目名和 01 Cover 均可返回封面。

第 3 到第 4 页使用插画轻微放大、淡入真实地图的过渡，不暗示插画建筑与数据网格逐一对应。系统开启“减少动态效果”时关闭缩放和滚动动画。

## 地图功能

保留当前已确认的地图版本：一屏桌面布局、Nunito、半透明填色、底图开关、透明度滑块、0–5 km 比例尺、单格详情、图例筛选，以及第 1 下选 A / 第 2 下选 B / 第 3 下重新选 A 的连续比较。

原数据中的 `canopy_pct_final` 计算口径和 5 个零值仍待核实；没有改变数据或移除数据说明。相关方法和源文件见 `canopy/README.md` 与 `canopy/data/`。

桌面浏览器为本版主要展示场景。窄屏下第四页可在地图页内纵向滚动；前三页保留横版插画完整比例。

## 修改内容

- `index.html`：前三幕文字、气泡文案和第四页 HTML。
- `story.css`：原素材位置、封面比例、故事页导航。
- `story.js`：四页进度、缩放/淡入、返回和跳转。
- `assets/`：原项目剪纸图片的网页副本，仅去掉透明留白并按网页尺寸缩小；未改变原始画面。
- `canopy/`：独立地图组件及原始 GeoJSON；地图样式和交互在对应 CSS/JS 中。

本文件夹是从原型素材和最新地图组件组合出的新版本，没有覆盖 OneDrive 中原来的项目。之后将整份源码作为网页项目根目录即可；如需接入其他已有页面，请保留相对路径和元素 ID 的唯一性。

## 数据更新

更换 canopy/data/ 中的 GeoJSON 后，在 canopy 文件夹运行 `python update-data.py` 更新 data.js。当前气泡中的 433 是本次导出的网格数；如果数据规模改变，需同步修改气泡数字。

Visual revision: new two-line Nunito project title on page 1; tighter Atlanta/subtitle spacing on pages 2–3; bubble copy lowered and drawn from team slide draft figures (~48%, downtown 10–30%, outer ring 60–80%). These figures are not recomputed from the grid and remain pending verification.
