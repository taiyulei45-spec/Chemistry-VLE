import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// 题库数据 (40道题，涵盖s, p, d, f区及医药应用)
// ==========================================
const QUIZ_DATA = [
  // --- s区元素 (1-10) ---
  {
    category: "s区元素",
    question: "1. 碱金属单质的密度总体自上而下增大，但钾 (K) 的密度却反常地小于钠 (Na)，根本原因是？",
    options: [
      "A. 钾的相对原子质量偏小",
      "B. 钾出现了全空的 3d 轨道，导致原子半径异常剧增",
      "C. 钾的晶体堆积方式发生了改变",
      "D. 钾的第一电离能大幅下降"
    ],
    correct: 1,
    feedback: "【批判性解析】正确！从 Na 到 K，K 开始出现了全空的 3d 轨道，电子云的排布导致原子半径发生了“非正常”的巨大膨胀。体积增大的倍数超过了质量增加的倍数，导致密度反而下降。"
  },
  {
    category: "s区元素",
    question: "2. 碳酸锂 (Li<sub>2</sub>CO<sub>3</sub>) 是临床上治疗双相情感障碍的首选药物。从微观性质看，Li<sup>+</sup> 发挥作用主要是因为它与人体内哪种重要离子产生了竞争拮抗？",
    options: [
      "A. K<sup>+</sup>",
      "B. Ca<sup>2+</sup>",
      "C. Na<sup>+</sup>",
      "D. Fe<sup>2+</sup>"
    ],
    correct: 2,
    feedback: "【批判性解析】正确！Li⁺ 与 Na⁺ 电荷相同且水合半径接近，Li⁺ 能通过神经细胞的钠离子通道潜入细胞内，干扰正常的 Na⁺ 信号传导和肌醇代谢，从而“冷却”过度兴奋的神经。"
  },
  {
    category: "s区元素",
    question: "3. 关于碱金属碳酸盐的热稳定性，Li<sub>2</sub>CO<sub>3</sub> 受热极易分解，而 Na<sub>2</sub>CO<sub>3</sub> 却极其稳定，其热力学和结构本质是？",
    options: [
      "A. Li<sup>+</sup> 半径极小，极化力极强，强烈扭曲并撕裂了 CO<sub>3</sub><sup>2-</sup> 中的 C-O 键",
      "B. Li<sub>2</sub>CO<sub>3</sub> 的晶格能远小于 Na<sub>2</sub>CO<sub>3</sub>",
      "C. Na<sup>+</sup> 的电负性更强",
      "D. 锂具有强烈的惰性电子对效应"
    ],
    correct: 0,
    feedback: "【批判性解析】正确！决定含氧酸盐热稳定性的关键是“阳离子的极化力”。Li⁺ 半径极小，电场强度极高，能将 CO₃²⁻ 中的 O²⁻ 电子云强力拉向自己（反极化），导致 C-O 键断裂释放 CO₂。"
  },
  {
    category: "s区元素",
    question: "4. 铍 (Be) 虽然是碱土金属，但其氢氧化物 Be(OH)<sub>2</sub> 却具有和 Al(OH)<sub>3</sub> 极为相似的两性特征。这体现了周期表中的什么规律？",
    options: [
      "A. 镧系收缩效应",
      "B. 屏蔽效应",
      "C. 对角线规则",
      "D. 钻穿效应"
    ],
    correct: 2,
    feedback: "【批判性解析】正确！Be 和 Al 处于周期表的对角线位置。它们的离子势 (电荷/半径比, Z/r) 几乎相等，极化能力极其相似，导致两者的化合物在酸碱性、共价性上表现出惊人的相似度。"
  },
  {
    category: "s区元素",
    question: "5. 消化道造影检查时，患者需要吞服“钡餐”。Ba<sup>2+</sup> 本身是剧毒重金属，为什么吞服 BaSO<sub>4</sub> 却对人体绝对安全？",
    options: [
      "A. BaSO<sub>4</sub> 会在胃酸中转化为无毒的 BaCl<sub>2</sub>",
      "B. BaSO<sub>4</sub> 的 K<sub>sp</sub> 极小，即使在强酸性胃液中也极难溶解，无法释放游离 Ba<sup>2+</sup>",
      "C. 胃黏膜对 Ba<sup>2+</sup> 具有绝对屏障作用",
      "D. 钡离子在体内会被迅速氧化"
    ],
    correct: 1,
    feedback: "【批判性解析】正确！BaSO₄ 是极难溶的强电解质 (Ksp 极小)，且 SO₄²⁻ 是强酸根，不受胃酸 (HCl) 的酸效应影响。因此它在消化道中始终保持固体状态，安全地阻挡 X 射线而不释放毒性离子。"
  },
  {
    category: "s区元素",
    question: "6. 碱金属的焰色反应绚丽多彩（如 Na 为黄色，K 为浅紫色）。从量子力学角度，焰色的产生对应于以下哪个过程？",
    options: [
      "A. 电子从低能级跃迁到高能级时吸收特定波长的光",
      "B. 外层电子脱离原子核束缚发生电离",
      "C. 激发态电子从高能级回落到较低能级时，以可见光子的形式释放能量",
      "D. 离子的晶格能转化为光能"
    ],
    correct: 2,
    feedback: "【批判性解析】正确！s 区最外层 ns¹ 电子受核束缚弱，加热易跃迁至激发态（吸热）。但激发态不稳定，电子瞬间回落至基态或较低能级时，能量差 ΔE 以光子 (E=hc/λ) 形式释放，若落在可见光区即产生焰色。"
  },
  {
    category: "s区元素",
    question: "7. 碱土金属硫酸盐 (MSO<sub>4</sub>) 的溶解度从 Be 到 Ba 依次急剧减小，其热力学本质原因是？",
    options: [
      "A. 晶格能的减小幅度大于水合能的减小幅度",
      "B. 水合能的减小幅度远大于晶格能的减小幅度",
      "C. 金属的金属性逐渐增强",
      "D. 离子的极化力逐渐增强"
    ],
    correct: 1,
    feedback: "【批判性解析】正确！溶解度取决于晶格能(阻碍溶解)与水合能(促进溶解)的博弈。由于 SO₄²⁻ 很大，阳离子变大对晶格能影响不显著；但阳离子变大导致其水合能急剧下降。水合能补偿不了晶格能，故溶解度骤降。"
  },
  {
    category: "s区元素",
    question: "8. KO<sub>2</sub> (超氧化钾) 被广泛用于潜水艇和太空舱的供氧系统中，它的特殊化学作用是？",
    options: [
      "A. 仅能吸收 CO<sub>2</sub>",
      "B. 仅能释放 O<sub>2</sub>",
      "C. 既能吸收 CO<sub>2</sub>，又能释放 O<sub>2</sub>",
      "D. 作为催化剂加速空气流动"
    ],
    correct: 2,
    feedback: "【批判性解析】正确！反应方程式为 4KO₂ + 2CO₂ → 2K₂CO₃ + 3O₂。它完美实现了“消耗人体废气”并“补充救命氧气”的双重功能，是绝佳的生化维生材料。"
  },
  {
    category: "s区元素",
    question: "9. 为什么纯净的液氨中加入金属钠后，溶液会变成深蓝色且具有极强的导电性？",
    options: [
      "A. 生成了蓝色的 NaNH<sub>2</sub> 沉淀",
      "B. 钠离子在液氨中发生了 d-d 跃迁",
      "C. 钠失去电子，生成了被氨分子包围的“溶剂化电子”，其吸收红光显蓝色",
      "D. 钠被氨气氧化生成了有色配合物"
    ],
    correct: 2,
    feedback: "【批判性解析】正确！碱金属溶于液氨会释放电子：Na → Na⁺ + e⁻。这些电子被氨分子包围形成“溶剂化电子 [e(NH₃)x]⁻”，具有极高的迁移率（导电）并吸收低频红光，使溶液呈现深蓝色。"
  },
  {
    category: "s区元素",
    question: "10. 在所有碱金属氢氧化物中，碱性最强的是？",
    options: [
      "A. LiOH",
      "B. NaOH",
      "C. KOH",
      "D. CsOH"
    ],
    correct: 3,
    feedback: "【批判性解析】正确！同主族自上而下，原子半径增大，M-O 键长增加，键能减弱，极易在水中解离出 OH⁻，因此 CsOH 是已知的最强碱之一。"
  },

  // --- p区元素 (11-20) ---
  {
    category: "p区元素",
    question: "11. 铋酸钠 (NaBiO<sub>3</sub>) 在强酸性条件下具有比 KMnO<sub>4</sub> 更猛烈的氧化性，能将 Mn<sup>2+</sup> 直接氧化为紫红色的 MnO<sub>4</sub><sup>-</sup>。Bi(V) 极度不稳定的根源是？",
    options: [
      "A. 镧系收缩效应",
      "B. 6s<sup>2</sup> 惰性电子对效应",
      "C. 强烈的配位效应",
      "D. d 轨道全空"
    ],
    correct: 1,
    feedback: "【批判性解析】正确！p 区第六周期元素 (如 Tl, Pb, Bi) 的 6s² 电子由于相对论效应和强钻穿效应，极难失去（惰性电子对）。这导致 Bi 极度偏爱 +3 价，+5 价的 Bi 拼命想抢夺电子退回 +3 价，表现出碾压级的强氧化性。"
  },
  {
    category: "p区元素",
    question: "12. 三氟化硼 (BF<sub>3</sub>) 被广泛用作有机合成的催化剂。其催化活性的微观本质是？",
    options: [
      "A. 容易解离出 H<sup>+</sup>，作为 Brønsted 酸",
      "B. 中心 B 原子存在未成键的孤对电子",
      "C. 中心 B 原子呈 sp<sup>2</sup> 杂化，留有一个完全空的 p 轨道，是极强的 Lewis 酸",
      "D. B-F 键极易断裂产生自由基"
    ],
    correct: 2,
    feedback: "【批判性解析】正确！BF₃ 中硼外围只有 6 个电子（缺电子）。其垂直于分子平面的空 p 轨道极其饥渴，能强力接纳反应底物的电子对，形成配位键，从而削弱底物原有的化学键实现催化。"
  },
  {
    category: "p区元素",
    question: "13. 卤素单质中，F<sub>2</sub> 与水反应直接放出 O<sub>2</sub>，而 Cl<sub>2</sub>、Br<sub>2</sub> 则发生歧化反应生成次卤酸和氢卤酸。F<sub>2</sub> 性质如此反常的原因不包括？",
    options: [
      "A. F 的电负性极大，氧化性远超 O<sub>2</sub>",
      "B. F 原子的价层没有可用的空 d 轨道",
      "C. F 无法表现出正氧化态",
      "D. F-F 共价键键能极大，难以断裂"
    ],
    correct: 3,
    feedback: "【批判性解析】正确！D 是错误的（因此是本题答案）。实际上，由于 F 原子太小，两个 F 原子靠近时，非键孤对电子之间产生了强烈的排斥力，导致 F-F 键能异常的“小”（极易断裂），这也是 F₂ 极其活泼的重要原因。"
  },
  {
    category: "p区元素",
    question: "14. 现代医学 CT 造影中广泛使用“碘海醇”。碘 (I) 被选作 X 光造影剂核心元素的量子力学依据是？",
    options: [
      "A. 碘离子在体内会发出强烈的荧光",
      "B. 碘的原子序数大 (Z=53)，拥有极其密集的核外电子云，能强力吸收和散射 X 射线",
      "C. 碘具有天然的低剂量放射性",
      "D. 碘能与血红蛋白发生配位变色"
    ],
    correct: 1,
    feedback: "【批判性解析】正确！X 射线的衰减系数与元素原子序数的 3 到 4 次方成正比。碘作为 p 区重元素，厚重的电子云就像一面“防弹盾牌”，阻止 X 射线穿透，从而在底片上形成高亮白影。"
  },
  {
    category: "p区元素",
    question: "15. 氙气 (Xe) 是一种稀有气体，但它却被用作高级的全身麻醉剂。作为完全惰性的分子，它如何与神经受体发生作用？",
    options: [
      "A. 形成稳定的共价键",
      "B. 形成氢键",
      "C. Xe 原子半径极大，极化率高，通过强烈的范德华力(色散力)嵌入受体的疏水空腔",
      "D. Xe 夺取了神经细胞的电子"
    ],
    correct: 2,
    feedback: "【批判性解析】正确！稀有气体并非绝对无法作用。Xe 半径巨大，外层电子云很“软”，容易变形产生瞬时偶极。这种强大的色散力足以让它卡入中枢神经系统蛋白受体的微小空腔中，物理性阻断神经传导。"
  },
  {
    category: "p区元素",
    question: "16. 常温常压下，氮气 (N<sub>2</sub>) 极其稳定，而同族的白磷 (P<sub>4</sub>) 却极易自燃。造成这种差异的根本键能结构是？",
    options: [
      "A. P 原子电负性更大",
      "B. N≡N 三键的键能极大，而 P 原子由于半径太大难以形成稳定的 pπ-pπ 多重键，只能形成张力巨大的单键",
      "C. 氮气分子存在氢键",
      "D. 白磷具有惰性电子对效应"
    ],
    correct: 1,
    feedback: "【批判性解析】正确！氮原子小，p 轨道肩并肩重叠程度大，形成极稳的 N≡N 三键。磷原子大，pπ-pπ 重叠极弱，只能通过 P-P 单键形成正四面体的 P₄ 分子，其键角仅 60°，存在极大的环张力，故极易断裂燃烧。"
  },
  {
    category: "p区元素",
    question: "17. 臭氧 (O<sub>3</sub>) 能吸收紫外线，保护地球生命。从分子结构看，O<sub>3</sub> 分子中存在什么特殊的化学键使其具有这种光学特性？",
    options: [
      "A. 离子键",
      "B. 三个离域的 sp 杂化键",
      "C. 一个大 π 键 (π<sub>3</sub><sup>4</sup>)，电子的离域与跃迁能够吸收紫外光子",
      "D. 氢键"
    ],
    correct: 2,
    feedback: "【批判性解析】正确！O₃ 是 V 型分子，中心 O 采取 sp² 杂化。三个 O 原子垂直于分子平面的 p 轨道侧面重叠，形成了一个 3 中心 4 电子的大 π 键。这种离域共轭体系极易吸收紫外光发生电子跃迁。"
  },
  {
    category: "p区元素",
    question: "18. 在抗多发性骨髓瘤的靶向药“硼替佐米”中，发挥“弹头”作用的元素是硼 (B)。其药理机制利用了硼的什么特性？",
    options: [
      "A. 强氧化性",
      "B. 放射性衰变",
      "C. 缺电子特性，提供空轨道与靶蛋白的氧原子形成配位键死锁",
      "D. 还原性"
    ],
    correct: 2,
    feedback: "【批判性解析】正确！这是元素化学与药学的完美结合。硼原子的空 p 轨道就像一把锁芯，特异性地吸纳癌细胞蛋白酶体苏氨酸残基上氧原子的孤对电子，形成极稳的配位键，导致该酶永久瘫痪。"
  },
  {
    category: "p区元素",
    question: "19. 以下关于卤素含氧酸的酸性规律，正确的是？",
    options: [
      "A. HClO > HClO<sub>2</sub> > HClO<sub>3</sub> > HClO<sub>4</sub>",
      "B. HClO<sub>4</sub> > HClO<sub>3</sub> > HClO<sub>2</sub> > HClO",
      "C. HBrO > HClO",
      "D. HIO<sub>4</sub> > HClO<sub>4</sub>"
    ],
    correct: 1,
    feedback: "【批判性解析】正确！同一卤素的含氧酸，氧化态越高，中心卤原子正电性越强，对 O-H 键中氧原子的电子云吸引力越大，使得 H⁺ 越容易解离。因此高氯酸 (HClO₄) 是无机酸中最强的酸之一。"
  },
  {
    category: "p区元素",
    question: "20. 自然界中碳的单质存在金刚石和石墨等同素异形体，且常温下石墨的热力学稳定性大于金刚石。决定石墨极高稳定性和导电性的结构是？",
    options: [
      "A. sp<sup>3</sup> 杂化的空间网状结构",
      "B. sp<sup>2</sup> 杂化形成的大 π 键离域电子网络",
      "C. 分子间存在的强氢键",
      "D. 离子键作用"
    ],
    correct: 1,
    feedback: "【批判性解析】正确！石墨层内 C 采取 sp² 杂化，剩余的 p 电子在整个碳层形成了极其庞大且稳定的离域大 π 键，使得能量降至极低，同时离域电子的自由移动赋予了其优异的导电性。"
  },

  // --- d区元素 (21-30) ---
  {
    category: "d区元素",
    question: "21. 经典抗癌药物“顺铂” (cis-[PtCl<sub>2</sub>(NH<sub>3</sub>)<sub>2</sub>]) 疗效卓越，而它的异构体“反铂”却无效。从配位空间结构看，这是因为顺铂具有：",
    options: [
      "A. sp<sup>3</sup> 四面体构型",
      "B. dsp<sup>2</sup> 平面正方形构型，且两个同侧脱氯后的空配位点间距刚好匹配 DNA 链上的相邻碱基，形成双点交联",
      "C. sp<sup>3</sup>d<sup>2</sup> 八面体构型",
      "D. 具有极高的极性从而破坏细胞膜"
    ],
    correct: 1,
    feedback: "【批判性解析】正确！Pt(II) 是 d⁸ 电子构型，偏爱形成平面正方形配合物。顺铂脱除两个 Cl⁻ 后，留下的“钳口”间距约 3.3Å，完美契合 DNA 鸟嘌呤 N7 的间距，死死扣住 DNA 阻断复制；而反铂由于空间角度不对，无法交联。"
  },
  {
    category: "d区元素",
    question: "22. 人体血液呈现鲜红色，根源在于血红蛋白卟啉环中心的 Fe<sup>2+</sup>。Fe<sup>2+</sup> 能够高效且“可逆”地运输 O<sub>2</sub> 的本质在于：",
    options: [
      "A. Fe<sup>2+</sup> 将 O<sub>2</sub> 彻底氧化",
      "B. 拥有未满的 d 轨道，既能接受 O<sub>2</sub> 的孤对电子配位，又能将自身的 d 电子反馈给 O<sub>2</sub> 的反键轨道，形成不至于太牢固的反馈 π 键",
      "C. Fe<sup>2+</sup> 的强离子极化作用",
      "D. 发生了 d-d 跃迁"
    ],
    correct: 1,
    feedback: "【批判性解析】正确！这是自然界最精妙的化学设计：配位键既要能“抓得住”氧气，又要能“松得开”。通过 σ 配位与 π 反馈键的动态协同，Fe²⁺ 实现了氧气的可逆装卸。若被氧化为 Fe³⁺，则失去这种能力。"
  },
  {
    category: "d区元素",
    question: "23. 大多数过渡金属的水合离子或配合物都呈现出绚丽的颜色（如 Cu<sup>2+</sup> 蓝、Ni<sup>2+</sup> 绿）。从晶体场理论看，颜色的产生是因为：",
    options: [
      "A. d 轨道电子完全电离吸收光能",
      "B. 配合物的配体自身带有色素",
      "C. 配体场导致 5 个简并的 d 轨道发生能级分裂，d 电子吸收可见光在分裂的轨道间发生 d-d 跃迁",
      "D. 金属离子的核裂变"
    ],
    correct: 2,
    feedback: "【批判性解析】正确！配体的静电场破坏了 d 轨道的球形对称，导致其分裂为低能态(t2g)和高能态(eg)。两者能级差(Δ)恰好位于可见光区。电子吸光跃迁，透射出的光即为其互补色。"
  },
  {
    category: "d区元素",
    question: "24. 虽然锌 (Zn)、镉 (Cd)、汞 (Hg) 位于 d 区，但它们的化合物大多是无色的，且几乎没有磁性。这是因为：",
    options: [
      "A. 它们是惰性气体",
      "B. 它们的价层 d 轨道处于 d<sup>10</sup> 全充满状态，既没有未成对电子，也无法发生 d-d 跃迁",
      "C. 它们没有 s 电子",
      "D. 它们的离子半径太小"
    ],
    correct: 1,
    feedback: "【批判性解析】正确！Zn²⁺、Cd²⁺、Hg²⁺ 的电子构型均为 (n-1)d¹⁰。因为 d 轨道已完全塞满，电子无法跃迁到同层高能级，故不显色；也没有未成对电子，故抗磁。它们常被称为“准过渡元素”。"
  },
  {
    category: "d区元素",
    question: "25. 钛合金 (Ti) 广泛用于人造骨骼和心脏起瓣器支架，这除了因为它强度高、质轻外，其优异生物相容性的化学基础是：",
    options: [
      "A. 钛在体内会持续缓慢溶解补充微量元素",
      "B. 表面极易氧化形成致密、稳定且化学惰性的 TiO<sub>2</sub> 保护膜，且无毒无排异反应",
      "C. 钛能与血液中的铁发生置换",
      "D. 钛具有放射性杀菌作用"
    ],
    correct: 1,
    feedback: "【批判性解析】正确！TiO₂ 极其稳定，不溶于体液，不引发免疫系统攻击，使得钛金属成为完美的“植入体”材料。"
  },
  {
    category: "d区元素",
    question: "26. 过渡金属在工业和生物体内常作为绝佳的催化剂（如 V<sub>2</sub>O<sub>5</sub> 催化制硫酸，细胞色素c酶）。其具有催化活性的决定性结构因素是：",
    options: [
      "A. 金属性弱",
      "B. 熔沸点高",
      "C. 具有未充满的 d 轨道和丰富的可变氧化态，易提供或接受电子充当反应中间体的“中转站”",
      "D. 具有极强的放射性"
    ],
    correct: 2,
    feedback: "【批判性解析】正确！催化剂的核心是降低反应活化能。过渡金属利用灵活的 d 轨道与底物临时配位，削弱底物化学键；又利用可变氧化态(如 Fe²⁺/Fe³⁺)实现电子的高效穿梭，犹如完美的流水线加工站。"
  },
  {
    category: "d区元素",
    question: "27. 往浅蓝色的 CuSO<sub>4</sub> 溶液中滴加浓氨水，最初产生蓝色沉淀，随后沉淀溶解，溶液变为极深的紫蓝色。这个过程中铜离子的配位与光吸收发生了什么变化？",
    options: [
      "A. 铜离子被氧化为 Cu<sup>3+</sup>",
      "B. 水配体被强场配体 NH<sub>3</sub> 取代，导致 d 轨道分裂能 Δ 增大，吸收光波长变短（发生蓝移）",
      "C. 铜离子发生了还原反应",
      "D. 生成了黑色的 CuO 胶体"
    ],
    correct: 1,
    feedback: "【批判性解析】正确！NH₃ 在光谱化学序列中排在 H₂O 前面，是强场配体。取代后，d 轨道分裂能(Δ)增大，导致吸收光能量变大（波长变短，如吸收橙黄光），透射出极深的互补色紫蓝色。"
  },
  {
    category: "d区元素",
    question: "28. 重金属（如 Hg, Pb, Cd）具有极高的毒性。从软硬酸碱理论 (HSAB) 的角度来看，其致毒机制主要是：",
    options: [
      "A. 它们是硬酸，与生命体内的硬碱（如水）反应",
      "B. 它们具有强氧化性烧伤组织",
      "C. 它们是典型的软酸（大而极化率高），对人体蛋白质中含有巯基 (-SH, 软碱) 的酶具有极强亲和力，致酶永久失活",
      "D. 它们具有极强的放射性"
    ],
    correct: 2,
    feedback: "【批判性解析】正确！重金属离子体积大、易极化，属于软酸。人体关键代谢酶中广泛存在半胱氨酸的巯基(-SH，软碱)。根据“软亲软”，重金属会死死咬住这些巯基，改变酶的空间构象，导致生化代谢彻底瘫痪。"
  },
  {
    category: "d区元素",
    question: "29. 第四周期 d 区元素的最外层电子数大多为 2 (4s<sup>2</sup>)，但铬 (Cr) 和铜 (Cu) 却反常地为 1 (4s<sup>1</sup>)。这是因为：",
    options: [
      "A. 惰性电子对效应",
      "B. 屏蔽效应太强",
      "C. 电子跃迁，以达到 d<sup>5</sup> (半满) 或 d<sup>10</sup> (全满) 的额外稳定状态",
      "D. s 轨道能量高于 d 轨道"
    ],
    correct: 2,
    feedback: "【批判性解析】正确！根据洪特规则特例，全充满(d¹⁰)、半充满(d⁵)和全空(d⁰)构型具有较低的能量和额外的稳定性。因此 Cr 为 3d⁵4s¹，Cu 为 3d¹⁰4s¹。"
  },
  {
    category: "d区元素",
    question: "30. 为什么银 (Ag) 制品在空气中放置久了会变黑，但纯金 (Au) 却历久弥新？",
    options: [
      "A. 银被空气中的 O<sub>2</sub> 氧化为黑色的 Ag<sub>2</sub>O",
      "B. 银对空气中微量的 H<sub>2</sub>S (硫化氢) 极度敏感，根据“软亲软”极易生成黑色极难溶的 Ag<sub>2</sub>S",
      "C. 银发生了衰变",
      "D. 银吸收了空气中的碳粉"
    ],
    correct: 1,
    feedback: "【批判性解析】正确！Ag⁺ 属于软酸，S²⁻ 属于极其典型的软碱，两者结合产生的 Ag₂S 溶度积(Ksp)小到令人发指。即使空气中只有极其微量的硫化物，也会导致银器表面迅速硫化发黑。金则过于惰性，不发生此反应。"
  },

  // --- f区元素及综合 (31-40) ---
  {
    category: "f区元素",
    question: "31. 在核磁共振 (MRI) 中，钆 (Gd) 配合物被作为最顶级的造影剂广泛使用。Gd<sup>3+</sup> 能大幅增强影像对比度的原子结构基础是：",
    options: [
      "A. 具有极强的放射性穿透人体",
      "B. 电子构型为 4f<sup>7</sup>，拥有多达 7 个未成对电子，产生极其巨大的顺磁磁矩，强烈扰动周围水分子的弛豫时间",
      "C. 能够吸收射频波发光",
      "D. 具有极高的密度"
    ],
    correct: 1,
    feedback: "【批判性解析】正确！造影剂的核心就是“磁性扰动”。f 轨道最多容纳 14 个电子，Gd³⁺ 恰好达到 4f⁷ 半满状态，7 个未成对电子的自旋方向一致，磁矩傲视群雄，是核磁显影的绝对王者。"
  },
  {
    category: "f区元素",
    question: "32. 导致著名的“镧系收缩”现象（即从 La 到 Lu 原子半径反常且持续缩小）的微观物理根源是：",
    options: [
      "A. 6s 电子的钻穿效应增强",
      "B. 4f 电子云极其弥散，互相之间的屏蔽效应极差，导致最外层电子感受到的有效核电荷显著急剧上升",
      "C. d 轨道能级下降",
      "D. 价电子数目不断减少"
    ],
    correct: 1,
    feedback: "【批判性解析】正确！增加的电子填入内层的 4f 轨道，但 f 电子云形状复杂且分散，像个漏风的筛子，挡不住原子核对最外层电子的强大引力。质子越加越多，引力越来越强，原子就被狠狠向内“缩水”。"
  },
  {
    category: "f区元素",
    question: "33. 镧系收缩不仅影响 f 区，还对其后的元素产生了深远影响。以下哪一对元素的性质因为镧系收缩而变得极其相似，以至于化学分离极为困难？",
    options: [
      "A. Ti (钛) 和 V (钒)",
      "B. Zr (锆) 和 Hf (铪)",
      "C. Cu (铜) 和 Ag (银)",
      "D. Fe (铁) 和 Co (钴)"
    ],
    correct: 1,
    feedback: "【批判性解析】正确！Zr 位于第五周期，Hf 位于第六周期。本应由于多一个电子层而半径变大，但镧系收缩正好抵消了这一增长，使得 Zr 和 Hf 半径几乎相等，化学性质如出一辙，分离它们是核工业界的一大难题。"
  },
  {
    category: "f区元素",
    question: "34. 大多数镧系元素的最稳定氧化态都是 +3 价，但铈 (Ce) 却能形成极稳定的 +4 价化合物（常作为强氧化剂，如硫酸铈）。原因是：",
    options: [
      "A. 铈的电负性最大",
      "B. 铈失去 4 个电子后，达到了 4f<sup>0</sup> 的全空极稳定电子构型",
      "C. 铈具有 5d<sup>10</sup> 的满壳层",
      "D. 铈位于锕系"
    ],
    correct: 1,
    feedback: "【批判性解析】正确！Ce 的外围排布是 4f¹5d¹6s²。当它失去 4 个价电子时，恰好清空了所有未满的轨道，达到了类似稀有气体氙 [Xe] 的完美核心结构。为了维持这种状态，Ce(IV) 极度渴望抢夺别人电子（强氧化性）。"
  },
  {
    category: "f区元素",
    question: "35. 钕铁硼 (NdFeB) 是目前人类能制造出的最强永磁材料（磁王），广泛用于电动汽车电机。镧系元素钕 (Nd) 赋予其绝强磁性的微观力学机制是：",
    options: [
      "A. Nd 本身是铁磁性的金属",
      "B. Nd 的体积大，把铁原子挤得更紧密",
      "C. Nd 含有未成对的 4f 电子，其极强的“自旋-轨道耦合”作用将晶格的磁矩方向死死锁定，产生极高的磁晶各向异性",
      "D. Nd 提供了大量自由电子"
    ],
    correct: 2,
    feedback: "【批判性解析】正确！铁虽然有磁性，但方向容易乱（矫顽力低）。Nd 的 4f 电子不仅贡献额外磁矩，更关键的是它的轨道角动量极大，像钉子一样把磁矩方向锚固在特定晶体轴上，让它极难被退磁。"
  },
  {
    category: "综合与特例",
    question: "36. 锝-99m (<sup>99m</sup>Tc) 是核医学中最常用的单光子发射计算机断层成像 (SPECT) 放射性显像剂。它的物理特性优势在于：",
    options: [
      "A. 释放强烈的 α 粒子烧死癌细胞",
      "B. 作为亚稳态核素，发生同质异能跃迁仅释放纯净且穿透力强的 γ 射线，不释放造成辐射损伤的 β 粒子，且半衰期（6h）绝佳",
      "C. 半衰期长达 1 万年，可长期显影",
      "D. 能发出强烈的可见光"
    ],
    correct: 1,
    feedback: "【批判性解析】正确！Tc-99m (m代表亚稳态) 就像一个充满内部能量却不开枪的核子。它平缓释放出 γ 光子（极易穿透人体被仪器捕捉成像），而不喷射破坏力极强的实体粒子（α或β），对患者辐射损伤极低。"
  },
  {
    category: "综合与特例",
    question: "37. 锕系元素（Ac 及其后元素）与镧系元素在电子排布上有许多相似处，但锕系的一个最显著的总体特征是：",
    options: [
      "A. 全部都是非金属",
      "B. 所有同位素都具有放射性（核不稳定性）",
      "C. 最高氧化态只有 +3",
      "D. 完全不具备磁性"
    ],
    correct: 1,
    feedback: "【批判性解析】正确！锕系元素原子核极其庞大拥挤，质子间的库仑斥力极强，导致原子核不再稳定，所有锕系元素无一例外均具有天然或人工的放射性衰变特性（如铀 U 和钚 Pu）。"
  },
  {
    category: "综合与特例",
    question: "38. 根据软硬酸碱 (HSAB) 理论，以下哪种解毒策略在药学上是极其危险甚至致命的？",
    options: [
      "A. 误食重金属盐 (如 Hg, Pb) 时，服用富含蛋白质（含巯基软碱）的生鸡蛋清或牛奶",
      "B. 使用强螯合剂 EDTA (多齿硬碱) 治疗钙通道异常",
      "C. 利用二巯基丙醇 (BAL，含两个-SH软碱) 解救砷(As)中毒",
      "D. 用硬碱 (如 F<sup>-</sup> 或 OH<sup>-</sup>) 试图解离体内已经与酶的巯基紧密结合的软酸重金属 (如 Hg<sup>2+</sup>)"
    ],
    correct: 3,
    feedback: "【批判性解析】正确！D 极其危险无效。Hg²⁺ 是典型软酸，体内酶的 -SH (巯基) 是软碱，软亲软结合极度牢固。试图用 F⁻ (最硬的硬碱) 去置换软碱简直是天方夜谭，必须用更强的软碱（如含有双巯基的解毒药 BAL）去“抢夺”。"
  },
  {
    category: "综合与特例",
    question: "39. 以下哪个现象不能用元素的“极化力 / 变形性”规律来解释？",
    options: [
      "A. AgF 易溶于水，而 AgI 却极难溶",
      "B. CaCO<sub>3</sub> 的热分解温度远高于 MgCO<sub>3</sub>",
      "C. 稀有气体从 He 到 Rn，沸点逐渐升高",
      "D. Na 还原性强于 Li"
    ],
    correct: 3,
    feedback: "【批判性解析】正确！D 的反常（其实水溶液中 Li 的还原电势反而比 Na 更负）主要取决于水合能的巨大差异，而非极化变形。A 中 Ag⁺ 强极化了巨大的 I⁻ 导致共价性激增而难溶；B 中 Mg²⁺ 极化力大于 Ca²⁺ 易撕裂碳酸根；C 中 Rn 半径大电子云易变形，色散力大。"
  },
  {
    category: "综合与特例",
    question: "40. 总结四大区元素的成键核心特征，以下描述最精准的一项是：",
    options: [
      "A. s区专注电子共用，p区专注离子化，d区仅有d-d跃迁，f区全为放射",
      "B. s区易失电子呈强金属性，p区易杂化且多变，d区利用空轨道主导配位与催化，f区深层轨道收缩且磁性奇异",
      "C. 所有的区都严格遵守八隅体规则",
      "D. 元素的化学性质仅仅取决于中子数"
    ],
    correct: 1,
    feedback: "【批判性解析】完美！这是对整张周期表最宏大而精准的概括。s区丢掉负担回归本真，p区花样百出构筑生命，d区搭桥牵线主导变革，f区深藏不露暗藏核能与磁力。恭喜你，通关元素化学极限挑战！"
  }
];

// ==========================================
// 挑战组件主逻辑
// ==========================================
export default function ElementChemistryChallenge() {
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  
  // 记录当前题目的状态: null(未答), { selected: number, isCorrect: boolean }
  const [answeredState, setAnsweredState] = useState(null);

  // 开始测试
  const handleStart = () => {
    setStarted(true);
    setCurrentIndex(0);
    setScore(0);
    setShowResult(false);
    setAnsweredState(null);
  };

  // 选择答案
  const handleOptionClick = (optionIndex) => {
    if (answeredState !== null) return; // 已经答过不能再改

    const isCorrect = optionIndex === QUIZ_DATA[currentIndex].correct;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setAnsweredState({
      selected: optionIndex,
      isCorrect: isCorrect
    });
  };

  // 下一题
  const handleNext = () => {
    if (currentIndex < QUIZ_DATA.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setAnsweredState(null);
    } else {
      setShowResult(true);
    }
  };

  // 计算评级
  const getRank = (finalScore) => {
    if (finalScore === 40) return { title: "SSR 级：元素造物主", color: "#fde047", glow: "0 0 30px #eab308" };
    if (finalScore >= 35) return { title: "S 级：量子大宗师", color: "#ec4899", glow: "0 0 25px #db2777" };
    if (finalScore >= 30) return { title: "A 级：高级研究员", color: "#8b5cf6", glow: "0 0 20px #7c3aed" };
    if (finalScore >= 20) return { title: "B 级：实验室新人", color: "#06b6d4", glow: "0 0 15px #0891b2" };
    return { title: "C 级：基础未筑牢", color: "#94a3b8", glow: "0 0 10px #64748b" };
  };

  // ---------------- Render ----------------
  if (!started) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={{color: "var(--cyan-glow)", textShadow: "0 0 15px var(--primary-blue)"}}>⚛️ 元素化学：终极极限挑战</h1>
          <p style={{color: "var(--text-muted)", fontSize: "1.1rem", marginBottom: "30px"}}>
            本题库包含整整 <strong>40</strong> 道硬核单选题，横跨 s, p, d, f 四大区块。<br/>
            深度融合量子结构、极化理论与前沿医学药理。准备好检验你的科研直觉了吗？
          </p>
          <button style={styles.btnLarge} onClick={handleStart}>
            接入神经直连模式，开始挑战
          </button>
        </div>
      </div>
    );
  }

  if (showResult) {
    const rank = getRank(score);
    return (
      <div style={styles.container}>
        <div style={{...styles.card, borderColor: rank.color, boxShadow: rank.glow}}>
          <h2 style={{color: "#fff", fontSize: "2rem"}}>测试完成！</h2>
          <div style={{fontSize: "5rem", margin: "20px 0", color: rank.color, textShadow: rank.glow}}>
            {score} <span style={{fontSize:"2rem", color:"var(--text-muted)"}}>/ 40</span>
          </div>
          <h3 style={{color: rank.color, fontSize: "1.8rem", marginBottom: "30px"}}>授予头衔：{rank.title}</h3>
          <p style={{color: "var(--text-muted)", marginBottom: "30px", padding: "0 20px"}}>
            化学的本质是打破旧有的平衡，重组物质的灵魂。愿你带着对微观世界的敬畏，在现实中缔造属于你的科学奇迹。
          </p>
          <button style={styles.btnOutline} onClick={handleStart}>
            重置内存，再次挑战
          </button>
        </div>
      </div>
    );
  }

  const currentQ = QUIZ_DATA[currentIndex];
  
  return (
    <div style={styles.container}>
      {/* 顶部进度条 */}
      <div style={styles.progressContainer}>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
          <span style={{color: 'var(--cyan-glow)', fontWeight: 'bold'}}>
            题目 {currentIndex + 1} <span style={{color: 'var(--text-muted)'}}>/ 40</span>
          </span>
          <span style={{color: 'var(--pink-glow)', fontWeight: 'bold'}}>
            所属区块: {currentQ.category}
          </span>
          <span style={{color: 'var(--life-green)', fontWeight: 'bold'}}>
            得分: {score}
          </span>
        </div>
        <div style={styles.progressBarBg}>
          <div style={{
            ...styles.progressBarFill, 
            width: `${((currentIndex) / 40) * 100}%`
          }}></div>
        </div>
      </div>

      {/* 题目展示卡片 */}
      <div style={styles.questionCard}>
        <h3 
          style={styles.questionText}
          dangerouslySetInnerHTML={{ __html: currentQ.question }}
        />

        <div style={styles.optionsGrid}>
          {currentQ.options.map((opt, idx) => {
            // 判断当前选项的样式
            let optStyle = { ...styles.optionBtn };
            let icon = "";

            if (answeredState !== null) {
              optStyle.cursor = 'not-allowed';
              if (idx === currentQ.correct) {
                // 正确答案高亮绿
                optStyle.backgroundColor = 'rgba(16, 185, 129, 0.2)';
                optStyle.borderColor = 'var(--life-green)';
                optStyle.color = '#fff';
                optStyle.boxShadow = '0 0 15px rgba(16, 185, 129, 0.3)';
                icon = "✅ ";
              } else if (idx === answeredState.selected && !answeredState.isCorrect) {
                // 选错的高亮红
                optStyle.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                optStyle.borderColor = 'var(--alert-red)';
                optStyle.color = '#fff';
                icon = "❌ ";
              } else {
                optStyle.opacity = 0.5;
              }
            }

            return (
              <button 
                key={idx}
                style={optStyle}
                onClick={() => handleOptionClick(idx)}
                disabled={answeredState !== null}
                onMouseEnter={(e) => {
                  if(!answeredState) {
                    e.currentTarget.style.borderColor = 'var(--cyan-glow)';
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if(!answeredState) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                  }
                }}
              >
                {icon}<span dangerouslySetInnerHTML={{ __html: opt }} />
              </button>
            );
          })}
        </div>

        {/* 答案解析 AI 面板 */}
        {answeredState !== null && (
          <div style={styles.feedbackBox}>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
              <span style={{fontSize:'20px'}}>🤖</span>
              <span style={{color: 'var(--cyan-glow)', fontWeight: 'bold'}}>AI 助教深度解析</span>
            </div>
            <div 
              style={{color: '#f8fafc', lineHeight: '1.6'}}
              dangerouslySetInnerHTML={{ __html: currentQ.feedback }}
            />
            <div style={{marginTop: '20px', textAlign: 'right'}}>
              <button style={styles.nextBtn} onClick={handleNext}>
                {currentIndex === 39 ? "查看最终评估报告" : "锁定记忆，进入下一题 ➔"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ==========================================
// 内联 CSS 样式字典 (深色赛博主题)
// ==========================================
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 5%',
    backgroundColor: '#0a0f1a', // var(--bg-dark)
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: '#cbd5e1'
  },
  card: {
    background: 'rgba(20, 30, 48, 0.8)',
    border: '1px solid var(--purple-med)',
    borderRadius: '16px',
    padding: '40px',
    textAlign: 'center',
    maxWidth: '800px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
    backdropFilter: 'blur(10px)'
  },
  btnLarge: {
    background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
    border: 'none',
    padding: '15px 30px',
    color: '#fff',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '18px',
    transition: 'all 0.3s ease',
    boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)'
  },
  btnOutline: {
    background: 'transparent',
    border: '1px solid #06b6d4',
    padding: '12px 25px',
    color: '#06b6d4',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
    transition: 'all 0.3s ease'
  },
  progressContainer: {
    width: '100%',
    maxWidth: '900px',
    marginBottom: '30px'
  },
  progressBarBg: {
    width: '100%',
    height: '6px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #06b6d4, #8b5cf6, #ec4899)',
    transition: 'width 0.4s ease-out'
  },
  questionCard: {
    width: '100%',
    maxWidth: '900px',
    background: 'rgba(20, 30, 48, 0.6)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderTop: '4px solid #8b5cf6',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
  },
  questionText: {
    fontSize: '1.25rem',
    color: '#fff',
    marginBottom: '25px',
    lineHeight: '1.6'
  },
  optionsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  optionBtn: {
    width: '100%',
    textAlign: 'left',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#cbd5e1',
    padding: '15px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '15px',
    lineHeight: '1.4'
  },
  feedbackBox: {
    marginTop: '25px',
    padding: '20px',
    borderRadius: '10px',
    background: 'rgba(6, 182, 212, 0.1)',
    border: '1px solid #06b6d4',
    animation: 'fadeIn 0.5s ease-in-out'
  },
  nextBtn: {
    background: '#1e293b',
    border: '1px solid #8b5cf6',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.2s',
    boxShadow: '0 0 10px rgba(139, 92, 246, 0.3)'
  }
};