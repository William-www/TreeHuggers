# Atlanta canopy — HTML 交互地图

## 先打开

1. 解压整个文件夹，保留所有子文件夹。
2. 双击 `index.html`，用浏览器打开即可。无需安装依赖或运行服务器。
3. 悬停 / 点击网格；先选 A，再选 B。第三次点击会开启新一轮比较：该网格成为新的 A，第四次点击设为 B。仍可用 Replace A / Replace B 单独替换。
4. 点击图例突出一个覆盖率区间，Show all 恢复；Clear picks 清除 A/B。
5. 小网格不便点选时，用右侧 Grid ID 下拉框。键盘进入地图后可用方向键移动、Enter 选择。

本包中 D3、Nunito、数据及 USGS 底图快照均在本地；打开页面无需地图服务或 API 请求。底图以 78% 不透明度、灰度和轻微暖色显示；网格填色默认 60% 不透明度，可用 Canopy layer opacity 滑块在 25%–100% 调节，可用 Basemap on/off 关闭。底图独立于覆盖率图层，开关不会改变网格数值、颜色或比较结果。

## 文件

- `index.html`：可运行的第二幕页面。
- `canopy-map.css`：Nunito、奶油纸色、纸片便签和响应式布局；样式限制在 `.canopy-chapter` 内。
- `canopy-map.js`：真实地理投影、详情、A/B 选择、百分点差、图例、键盘操作。
- `data.js`：原始两个 GeoJSON 转为网页可直接载入的数据；没有重算覆盖率。
- `data/`：保留原始导出文件供核查。
- `assets/`：D3 7.9.0、Nunito 和对应许可证。

## 加入你们现有 HTML

先复制完整文件夹到项目内，例如 `canopy/`。不要覆盖你们原来的 index.html。

直接集成方法：

1. 在你们 HTML 的 `<head>` 中加入 `<link rel="stylesheet" href="canopy/canopy-map.css">`。
2. 把本页面 `<section class="canopy-chapter" ...>` 到对应 `</section>` 的完整内容，粘贴到第一幕之后。
3. 在你们页面的 `</body>` 前依次加入：

```html
<script src="canopy/assets/d3.min.js"></script>
<script src="canopy/data.js"></script>
<script src="canopy/basemap.js"></script>
<script src="canopy/canopy-map.js"></script>
```

如果页面已有兼容的 D3 7，可复用，不要重复载入。CSS 中的字体路径相对 CSS 文件，无需改动。地图 ID 必须保持唯一。本组件在页面上只放一份。

第一幕的滚动按钮可以先指向 `#canopy-chapter`。精确的插画缩放与章节过渡需要结合你们现有的第一幕 HTML/CSS/JS；本包没有假装已经修改你们的主项目。

## 数据口径：发布结论前必须核对

433 个网格；稳定标识是 `id`；原投影的 left/right 和 top/bottom 差为 1,000 m。GeoJSON 形状已裁到市界，因此边缘格不能统称面积 1 km²。

当前读取 `canopy_pct_final`，没有用 canopymean 或 canopy_pct 替换；0–86.752%，无空值，编号无重复。

你说明分母为完整 1 km²，但导出中字段存在口径差异。Grid 16 的 canopycount=4564、canopy_pct=0.456、canopy_pct_final=53.83。必须回看 QGIS 字段计算表达式，确认 final 的分母与像元面积，不能仅凭字段名判断。网页保留最终字段并明确标注待核实。

Grid 323、324、350、351、586 的 final=0 且 canopymean=null。这 5 格以斜线标记；保留原数值，不擅自判定无树冠或 NoData。涉及它们的比较有额外提示。

比较采用原始数值相减后显示一位小数，单位为 percentage points。显示的两个已四舍五入百分比可能与差值末位略有不同。没有计算全市平均数，也没有虚构社区名称、热暴露或 HOLC 属性。

分级为 [0,17)、[17,35)、[35,52)、[52,69)、[69,100]，图例末档使用完整百分比范围。实际数据最大值为 86.752%。这些固定阈值不会随筛选改变。

## 更新数据

替换 data/ 下的 GeoJSON 后，运行 `python update-data.py` 重新生成 data.js；仅替换 GeoJSON 不会自动更新网页。保持属性名和 id 稳定。数据中没有可信年份字段，因此页面未声明年份。

## 后续接主项目

把你们现有的 index.html、CSS、滚动脚本和第一幕使用的图片一起提供，即可把该章节接到原来的第一幕。请同时提供 QGIS 的 canopy_pct_final 字段计算表达式以消除统计口径疑问。


## 浅色底图

`basemap.js` 包含 USGS The National Map / USGS Topo 的固定范围图片快照。快照与 D3 地图使用同一 Web Mercator 范围，位于全部网格下方。网格半透明叠在底图之上，市界内外的道路、河流和地名均作为位置参照。底图开启时移除实心纸张底衬，悬停只显示轮廓，避免盖住地图文字。透明混合会影响颜色观感，精确比较以便签数值与 A/B 条形为准；覆盖率分级和原始数值不变。来源链接保留在地图下方。底图不是树冠观测日期对应的历史底图。

USGS 服务：https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer
USGS 数据使用说明：https://www.usgs.gov/faqs/what-are-terms-uselicensing-map-services-and-data-national-map

如果以后改变投影、地图范围或添加可拖动缩放，需要同步更新底图范围或改成动态瓦片；不要直接拉伸此快照来匹配另一种投影。


## 剪纸素材版

装饰直接复用团队原始素材：11_Sun、Cloud_02_Low、Leaf_01_Olive、Tree_01_Oak、Foreground_03_Low。仅制作适合网页显示的缩小 WebP 副本，保留透明背景；原始素材未改动。对应来源见 assets/papercut-sources.txt。太阳和云位于标题说明区，叶片位于便签角部，树丛和橡树位于章节结尾，均不承担覆盖率编码、地理位置或树木数量含义。装饰均排除在辅助技术阅读和点击事件之外。


## 一屏布局修订

桌面宽度超过 760 px 时，章节高度适配浏览器可视高度（最低 600 px），整个地图、图例、透明度控件与 A/B 比较区同时显示。窄屏手机改为上下排列。方法说明折叠在页脚，展开为浮层。

已撤下独立太阳、云、叶片、森林等装饰，保留奶油纸色、Nunito 和便签纸的轻微质感。原装饰文件保存在源码 assets 内以便后续有明确用途时复用，本页面没有加载这些装饰。

比例尺为 0–5 km，位于地图下缘。用当前 D3 Mercator 投影反解比例尺两端经纬度，并用球面距离校准到 5,000 m（平均地球半径 6,371,008.8 m）。网页尺寸变化时，地图和比例尺在同一 SVG viewBox 中等比缩放；文字字号单独调整以保持可读。该比例尺代表下缘纬度附近的地面距离，不能用截图上固定像素数推算其它地图的比例。
