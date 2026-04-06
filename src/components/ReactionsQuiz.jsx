import React, { useState, useEffect, useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

// ==========================================
// 题库数据：50道极限挑战题 (严格按7大模块分布)
// ==========================================
const quizData = [
  // --- 模块1：稀溶液理论 (7题) ---
  { id: 1, category: '稀溶液', q: "稀溶液的依数性（如蒸气压下降、沸点升高）主要取决于？", options: ["溶质的化学性质", "溶质微粒的物理大小", "溶液中溶质微粒的数目", "溶剂的密度"], ans: 2, exp: "依数性的本质在于“只看数量不论出身”，仅与一定量溶剂中溶质微粒的总数成正比。" },
  { id: 2, category: '稀溶液', q: "临床上大量输液时，必须使用等渗溶液（如0.9% NaCl）。若误输纯水，红细胞会发生什么？", options: ["皱缩", "溶血（吸水胀破）", "形态不变", "凝集"], ans: 1, exp: "纯水渗透压极低，水分会自发通过细胞膜涌入红细胞内部，导致细胞膨胀甚至破裂。" },
  { id: 3, category: '稀溶液', q: "某非挥发性非电解质水溶液的沸点为 100.52 ℃（已知水的 Kb = 0.52 K·kg/mol），则该溶液的质量摩尔浓度约为？", options: ["0.5 mol/kg", "1.0 mol/kg", "2.0 mol/kg", "无法计算"], ans: 1, exp: "ΔTb = Kb × b。0.52 = 0.52 × b，得出 b = 1.0 mol/kg。" },
  { id: 4, category: '稀溶液', q: "冬天在汽车水箱中加入乙二醇的主要目的是？", options: ["降低水的凝固点", "提高水的比热容", "防止水箱生锈", "降低水的沸点"], ans: 0, exp: "乙二醇作为溶质加入水中，利用稀溶液依数性降低溶液的凝固点，防止结冰胀破水箱。" },
  { id: 5, category: '稀溶液', q: "反渗透技术（RO）常用于海水淡化，其核心原理是？", options: ["施加高于海水渗透压的压力", "加热使水蒸发", "利用半透膜吸附盐分离子", "降低海水的温度"], ans: 0, exp: "施加大于渗透压的外压，迫使水分子逆向（从高浓度向低浓度）穿过半透膜。" },
  { id: 6, category: '稀溶液', q: "相同浓度的下列水溶液，渗透压最大的是？", options: ["葡萄糖", "NaCl", "CaCl2", "AlCl3"], ans: 3, exp: "依数性与微粒数成正比。AlCl3完全解离产生4个离子，粒子总浓度最大。" },
  { id: 7, category: '稀溶液', q: "拉乌尔定律 (Raoult's Law) 的适用条件是？", options: ["任何溶液", "难挥发非电解质稀溶液", "强电解质浓溶液", "挥发性溶质溶液"], ans: 1, exp: "拉乌尔定律描述的是难挥发、非电解质稀溶液的蒸气压下降规律。" },
  
  // --- 模块2：化学热力学 (8题) ---
  { id: 8, category: '热力学', q: "下列哪个物理量不是热力学状态函数？", options: ["内能 (U)", "焓 (H)", "热量 (Q)", "吉布斯自由能 (G)"], ans: 2, exp: "热量(Q)和功(W)是途径函数，其大小与过程进行的具体途径有关。" },
  { id: 9, category: '热力学', q: "盖斯定律 (Hess's Law) 的核心结论是：化学反应的热效应仅与？", options: ["反应的时间有关", "反应的中间产物有关", "反应的始态和终态有关", "反应的活化能有关"], ans: 2, exp: "由于焓(H)是状态函数，反应的焓变只取决于始末状态，与具体反应途径无关。" },
  { id: 10, category: '热力学', q: "孤立系统内自发进行的过程，其总熵变 (ΔS) 必然？", options: ["大于零", "小于零", "等于零", "无法确定"], ans: 0, exp: "热力学第二定律（熵增原理）：孤立系统中的自发过程总是向着熵增加的方向进行。" },
  { id: 11, category: '热力学', q: "恒温恒压下，判断化学反应自发进行方向的唯一判据是？", options: ["ΔH < 0", "ΔS > 0", "ΔG < 0", "ΔU < 0"], ans: 2, exp: "吉布斯自由能变 (ΔG = ΔH - TΔS) 小于 0 是恒温恒压下过程自发性的绝对判据。" },
  { id: 12, category: '热力学', q: "某反应 ΔH > 0，ΔS > 0。该反应在什么条件下自发？", options: ["任何温度", "低温自发", "高温自发", "任何温度均不自发"], ans: 2, exp: "根据 ΔG = ΔH - TΔS，当 ΔH>0 且 ΔS>0 时，只有在高温下 TΔS 项足够大，才能使 ΔG < 0。" },
  { id: 13, category: '热力学', q: "标准状态下，下列物质中标准摩尔生成焓 (ΔfHm⊖) 为零的是？", options: ["CO2 (g)", "O3 (g)", "O2 (g)", "H2O (l)"], ans: 2, exp: "规定在标准状态下，最稳定单质的标准摩尔生成焓为零。O2比O3稳定。" },
  { id: 14, category: '热力学', q: "对于反应 C(s) + O2(g) = CO2(g)，其恒压反应热 (Qp) 与恒容反应热 (Qv) 的关系是？", options: ["Qp > Qv", "Qp < Qv", "Qp = Qv", "无法比较"], ans: 2, exp: "Qp = Qv + Δn(g)RT。该反应前后气体分子数不变 (Δn=0)，故 Qp = Qv。" },
  { id: 15, category: '热力学', q: "当化学反应达到热力学平衡时，下列说法正确的是？", options: ["ΔG⊖ = 0", "ΔG = 0", "K = 0", "反应停止"], ans: 1, exp: "平衡时，体系的吉布斯自由能降至最低，做非体积功的能力为零，即实际 ΔG = 0。" },

  // --- 模块3：化学动力学 (7题) ---
  { id: 16, category: '动力学', q: "决定化学反应速率常数 (k) 的主要因素是？", options: ["反应物浓度", "系统压力", "反应温度和活化能", "反应容器体积"], ans: 2, exp: "根据阿伦尼乌斯方程 k = A·e^(-Ea/RT)，速率常数 k 取决于温度 T 和活化能 Ea。" },
  { id: 17, category: '动力学', q: "加入正催化剂能极大加快反应速率的根本原因是？", options: ["增加碰撞频率", "提高体系温度", "降低反应的活化能", "增加反应物浓度"], ans: 2, exp: "催化剂通过改变反应途径，提供了一条活化能更低的通道，从而使得有效碰撞呈指数级增加。" },
  { id: 18, category: '动力学', q: "某反应的速率常数 k 的单位是 mol/(L·s)，则该反应是？", options: ["零级反应", "一级反应", "二级反应", "三级反应"], ans: 0, exp: "速率 v 的单位总是 mol/(L·s)。若 v = k[A]^0，则 k 的单位与 v 相同，为零级反应。" },
  { id: 19, category: '动力学', q: "温度每升高 10℃，反应速率通常增加 2~4 倍。微观解释是？", options: ["分子体积变大", "活化分子百分数显著增加", "活化能降低", "反应物浓度增加"], ans: 1, exp: "升温使分子平均动能增加，能量大于活化能的“活化分子”比例呈指数级增加。" },
  { id: 20, category: '动力学', q: "对于多步组成的复杂反应，总反应速率主要取决于？", options: ["最快的一步", "最慢的一步 (决速步)", "各步速率的平均值", "最后一步"], ans: 1, exp: "最慢的基础反应（决速步）就像木桶效应中最短的木板，直接决定了整个反应的快慢。" },
  { id: 21, category: '动力学', q: "催化剂能否改变反应的平衡转化率？", options: ["能，显著提高", "不能", "视温度而定", "视压力而定"], ans: 1, exp: "催化剂同等程度地降低正、逆反应的活化能，只缩短达到平衡的时间，不改变热力学平衡限度。" },
  { id: 22, category: '动力学', q: "过渡态理论认为，反应物转化为产物必须经过？", options: ["中间产物", "高能量的活化络合物", "低能量的基态", "电子转移"], ans: 1, exp: "反应物必须爬过能量最高点的“势能垒”，形成活化络合物（过渡态），才能生成产物。" },

  // --- 模块4：酸碱平衡 (8题) ---
  { id: 23, category: '酸碱平衡', q: "根据酸碱质子理论，下列物种中既能作酸又能作碱（两性物质）的是？", options: ["HCl", "CO3(2-)", "HCO3(-)", "NH4(+)"], ans: 2, exp: "HCO3(-) 既能给出质子变成 CO3(2-)，又能接受质子变成 H2CO3。" },
  { id: 24, category: '酸碱平衡', q: "一对共轭酸碱对（如 HAc 和 Ac⁻）的 Ka 与 Kb 的关系是？", options: ["Ka + Kb = 14", "Ka / Kb = Kw", "Ka × Kb = Kw", "Ka = Kb"], ans: 2, exp: "在水溶液中，共轭酸碱对的解离常数乘积严格等于水的离子积 Kw (1.0 × 10^-14)。" },
  { id: 25, category: '酸碱平衡', q: "配制 pH = 5.0 的缓冲溶液，应选择下列哪种弱酸及其盐？", options: ["甲酸 (pKa=3.75)", "醋酸 (pKa=4.76)", "磷酸二氢钠 (pKa=7.20)", "氯化铵 (pKa=9.25)"], ans: 1, exp: "缓冲溶液在 pH = pKa 时缓冲能力最强，应选择 pKa 最接近目标 pH 的弱酸体系。" },
  { id: 26, category: '酸碱平衡', q: "向 0.1 mol/L 氨水中加入少量 NH4Cl 固体，氨水的解离度会？", options: ["增大", "减小", "不变", "先增后减"], ans: 1, exp: "同离子效应：加入含有相同离子 (NH4+) 的强电解质，迫使解离平衡向左移动，解离度骤降。" },
  { id: 27, category: '酸碱平衡', q: "强酸滴定弱碱（如 HCl 滴定 NH3）时，滴定突跃在什么范围，应选什么指示剂？", options: ["碱性，酚酞", "酸性，甲基橙", "中性，石蕊", "无法确定"], ans: 1, exp: "生成的强酸弱碱盐显酸性，计量点 pH < 7，应选择变色范围在酸性的甲基橙。" },
  { id: 28, category: '酸碱平衡', q: "水对 HClO4、HCl、HNO3 表现出的效应称为？", options: ["区分效应", "同离子效应", "拉平效应", "盐效应"], ans: 2, exp: "水作为较强的碱，能将这些强酸的质子全部夺走，无法区分它们的强弱，称为拉平效应。" },
  { id: 29, category: '酸碱平衡', q: "已知 H2CO3 的 pKa1=6.38, pKa2=10.25。0.1M NaHCO3 溶液的 pH 约为？", options: ["6.38", "8.32", "10.25", "7.00"], ans: 1, exp: "两性物质的最简计算公式：pH = 1/2(pKa1 + pKa2) = 1/2(6.38 + 10.25) = 8.315。" },
  { id: 30, category: '酸碱平衡', q: "缓冲溶液能够抵抗外来酸碱的原因是？", options: ["强电解质完全解离", "存在能消耗 H+ 的抗酸成分和消耗 OH- 的抗碱成分", "水的离子积很大", "离子强度大"], ans: 1, exp: "缓冲溶液如 HAc-Ac⁻ 中，Ac⁻ 结合外加的 H⁺，HAc 中和外加的 OH⁻，如同化学海绵。" },

  // --- 模块5：沉淀溶解平衡 (7题) ---
  { id: 31, category: '沉淀平衡', q: "溶度积规则指出，当体系的离子积 Qc 大于 Ksp 时？", options: ["溶液不饱和", "达到平衡", "产生沉淀", "沉淀溶解"], ans: 2, exp: "Qc > Ksp 表明体系过饱和，平衡将向左移动，离子结合产生沉淀析出。" },
  { id: 32, category: '沉淀平衡', q: "向 BaSO4 饱和溶液中加入大量 KNO3，溶解度会微小增大，这是由于？", options: ["同离子效应", "盐效应", "酸效应", "配位效应"], ans: 1, exp: "加入不含有相同离子的强电解质，使溶液离子强度增大，活度系数减小，导致沉淀略微溶解。" },
  { id: 33, category: '沉淀平衡', q: "溶液中同时含有 Cl⁻ 和 I⁻，滴加 AgNO3 时，谁先沉淀？(Ksp(AgCl)=10^-10, Ksp(AgI)=10^-16)", options: ["AgCl", "AgI", "同时沉淀", "无法比较"], ans: 1, exp: "所需沉淀剂浓度越小的越先沉淀。AgI 的 Ksp 极小，所需的 Ag⁺ 极低，故优先析出沉淀。" },
  { id: 34, category: '沉淀平衡', q: "沉淀转化的方向通常是？", options: ["向生成更易溶沉淀的方向", "向生成更难溶沉淀的方向", "与Ksp无关", "必须加热"], ans: 1, exp: "沉淀转化遵循热力学自发方向，通常 Ksp 较大（易溶）的沉淀会自发转化为 Ksp 较小（难溶）的沉淀。" },
  { id: 35, category: '沉淀平衡', q: "莫尔法 (Mohr) 测定 Cl⁻ 浓度时，选用的指示剂是？", options: ["K2Cr2O7", "K2CrO4", "酚酞", "荧光黄"], ans: 1, exp: "莫尔法利用铬酸钾作指示剂。当白色的 AgCl 沉淀完全后，稍微过量的 Ag⁺ 会立即与 CrO4²⁻ 生成砖红色的 Ag2CrO4 沉淀示警。" },
  { id: 36, category: '沉淀平衡', q: "往 ZnS 沉淀中通入 HCl，沉淀溶解的原因是？", options: ["发生配位反应", "氧化还原反应", "生成弱电解质 H2S 导致 S²⁻ 浓度大减", "盐效应"], ans: 2, exp: "H⁺ 与 S²⁻ 结合生成微溶于水的 H2S 气体逃逸，使得离子积 Qc < Ksp，沉淀溶解。" },
  { id: 37, category: '沉淀平衡', q: "已知 PbCl2 的 Ksp = 1.6×10^-5，其在纯水中的溶解度 s 约为？", options: ["1.6×10^-5 M", "4.0×10^-3 M", "1.6×10^-2 M", "2.0×10^-2 M"], ans: 2, exp: "PbCl2 ⇌ Pb²⁺ + 2Cl⁻，Ksp = s * (2s)^2 = 4s^3。解得 s ≈ 1.58×10^-2 M。" },

  // --- 模块6：氧化还原平衡 (7题) ---
  { id: 38, category: '氧化还原', q: "能斯特方程 (Nernst Eq) 揭示了什么对电极电势的影响？", options: ["催化剂", "离子浓度和 pH", "反应容器大小", "活化能"], ans: 1, exp: "能斯特方程 E = E⊖ - (RT/nF)lnQ 定量描述了参与反应的离子浓度、酸碱度(pH)对实际电势的巨大影响。" },
  { id: 39, category: '氧化还原', q: "原电池中，标准电极电势 (E⊖) 越大的电对，其氧化态物质？", options: ["还原性越强", "氧化性越强", "越容易失电子", "无法判断"], ans: 1, exp: "电极电势越高，代表其氧化态抢夺电子的能力越强，作强氧化剂（通常作原电池正极）。" },
  { id: 40, category: '氧化还原', q: "在元素电势图 (Latimer 图) 中，中间氧化态发生自发歧化的条件是？", options: ["E右 < E左", "E右 = E左", "E右 > E左", "电势均为负"], ans: 2, exp: "当右侧电对的电势大于左侧电势时（E右 > E左），发生歧化反应的 ΔE > 0，在热力学上自发。" },
  { id: 41, category: '氧化还原', q: "对于反应：Cu²⁺ + Zn ⇌ Cu + Zn²⁺，要使其反向进行，可以采取？", options: ["增加 Cu²⁺ 浓度", "增加 Zn²⁺ 浓度，极度降低 Cu²⁺ 浓度", "加入催化剂", "增加 Zn 质量"], ans: 1, exp: "根据能斯特方程，极度增大生成物浓度并减小反应物浓度，可使实际电动势 ΔE < 0，从而逆转反应方向。" },
  { id: 42, category: '氧化还原', q: "浓差电池的产生是因为？", options: ["两极金属材料不同", "使用了强电解质", "同一电对两极的浓度存在差异", "加入不同催化剂"], ans: 2, exp: "材料相同但浓度不同的半电池，根据能斯特方程会产生电势差，高浓度端作正极，低浓度端作负极。" },
  { id: 43, category: '氧化还原', q: "反应 2MnO4⁻ + 5C2O4²⁻ + 16H⁺ ⇌ 2Mn²⁺ + 10CO2 + 8H2O 速率先慢后快的原因？", options: ["温度急剧升高", "高锰酸钾浓度变大", "生成的 Mn²⁺ 起了自催化作用", "压力改变"], ans: 2, exp: "反应生成的 Mn²⁺ 恰好是该反应的优良催化剂。随着产物积累，发生“自催化”现象，反应瞬间加速。" },
  { id: 44, category: '氧化还原', q: "氧化还原反应达到动态平衡时，系统的电动势 ΔE 和自由能变 ΔG 为？", options: ["ΔE = 0, ΔG = 0", "ΔE > 0, ΔG < 0", "ΔE < 0, ΔG > 0", "不确定"], ans: 0, exp: "平衡时，体系做最大非体积功的能力降为零，即 ΔG = 0。根据 ΔG = -nFΔE，系统的实际电动势 ΔE 必然为 0。" },

  // --- 模块7：配位平衡 (6题) ---
  { id: 45, category: '配位平衡', q: "配位化合物中的中心金属离子，从酸碱理论看属于？", options: ["布朗斯特酸", "路易斯酸 (电子对接受体)", "路易斯碱", "两性物质"], ans: 1, exp: "中心金属离子通常具有空轨道，能够接受配体提供的孤对电子，属于路易斯酸。" },
  { id: 46, category: '配位平衡', q: "晶体场理论 (CFT) 中，八面体场使 d 轨道分裂为两组，它们是？", options: ["t2g(低) 和 eg(高)", "eg(低) 和 t2g(高)", "不分裂", "分裂为5个不同能级"], ans: 0, exp: "在八面体场中，迎着配体方向的 eg 轨道能量升高，避开配体的 t2g 轨道能量降低。" },
  { id: 47, category: '配位平衡', q: "CO 中毒机理在于 CO 是极强场配体。强场配体会导致？", options: ["晶体场分裂能 Δo 小于成对能", "形成高自旋配合物", "晶体场分裂能 Δo 极大，形成低自旋配合物", "无法结合金属"], ans: 2, exp: "CO 由于具有强烈的 π 反馈键，产生巨大的分裂能，迫使电子在 t2g 轨道低自旋配对，形成不可逆的稳定死锁。" },
  { id: 48, category: '配位平衡', q: "EDTA 能解重金属毒的核心热力学驱动力是？", options: ["显著的放热效应", "螯合效应导致的巨大熵增 (ΔS > 0)", "催化效应", "同离子效应"], ans: 1, exp: "EDTA 是六齿配体，1个 EDTA 取代 6 个水合水分子，体系的微粒数剧增，系统混乱度增加，熵增驱动络合物极度稳定。" },
  { id: 49, category: '配位平衡', q: "向 Fe³⁺/Fe²⁺ 电对中加入大量 CN⁻，其电极电势会？", options: ["显著升高", "显著降低", "不变", "降至零"], ans: 1, exp: "CN⁻ 会与高价的 Fe³⁺ 形成极其稳定的络合物，导致游离 [Fe³⁺] 断崖式下降，根据能斯特方程，电极电势将大幅降低。" },
  { id: 50, category: '配位平衡', q: "顺铂 [Pt(NH3)2Cl2] 具有抗癌活性，其中心原子的杂化和构型是？", options: ["sp3, 正四面体", "dsp2, 平面正方形", "sp3d2, 八面体", "sp, 直线型"], ans: 1, exp: "Pt²⁺ 是 d8 构型，在强场下通常发生 dsp2 杂化，形成独特的平面正方形构型，这正是其能精准嵌入 DNA 阻断复制的关键。" },
];

export default function ReactionsQuiz() {
  const [stage, setStage] = useState('start'); // 'start', 'playing', 'result'
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600); // 60分钟
  const [score, setScore] = useState(0);
  const [radarChartData, setRadarChartData] = useState([]);

  // 倒计时
  useEffect(() => {
    let timer;
    if (stage === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && stage === 'playing') {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [stage, timeLeft]);

  // 选择答案
  const handleSelect = (optIndex) => {
    setAnswers({ ...answers, [currentQ]: optIndex });
  };

  // 交卷评分机制
  const handleSubmit = () => {
    let totalScore = 0;
    const categoryStats = {
      '稀溶液': { total: 0, correct: 0 },
      '热力学': { total: 0, correct: 0 },
      '动力学': { total: 0, correct: 0 },
      '酸碱平衡': { total: 0, correct: 0 },
      '沉淀平衡': { total: 0, correct: 0 },
      '氧化还原': { total: 0, correct: 0 },
      '配位平衡': { total: 0, correct: 0 }
    };

    quizData.forEach((q, index) => {
      categoryStats[q.category].total += 1;
      if (answers[index] === q.ans) {
        totalScore += 2; // 每题2分，满分100
        categoryStats[q.category].correct += 1;
      }
    });

    // 组装雷达图数据
    const chartData = Object.keys(categoryStats).map(key => ({
      subject: key,
      score: Math.round((categoryStats[key].correct / categoryStats[key].total) * 100),
      fullMark: 100
    }));

    setScore(totalScore);
    setRadarChartData(chartData);
    setStage('result');
  };

  // 格式化时间
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ---------------- Render 屏幕逻辑 ----------------
  if (stage === 'start') {
    return (
      <div style={styles.container}>
        <div style={styles.startCard}>
          <span className="material-symbols-outlined" style={{ fontSize: '80px', color: 'var(--alert-red)', marginBottom: '20px' }}>local_fire_department</span>
          <h1 style={{ fontSize: '36px', color: '#fff', margin: '0 0 20px' }}>反应基础：全景极限挑战</h1>
          <p style={{ color: '#cbd5e1', fontSize: '16px', lineHeight: 1.8, maxWidth: '600px', margin: '0 auto 40px' }}>
            警告：您即将进入 SMARTCHEM VLE 最高难度的测验舱。<br/>
            本次试炼包含 <strong>50 道</strong> 考研与国家级竞赛难度单选题，涵盖本模块下所有的 7 个核心理论领域。<br/>
            时限：<strong style={{ color: 'var(--alert-red)' }}>60 分钟</strong>。准备好迎接大脑的燃烧了吗？
          </p>
          <button style={styles.btnDanger} onClick={() => setStage('playing')}>🔥 接受挑战 (START)</button>
        </div>
      </div>
    );
  }

  if (stage === 'playing') {
    const q = quizData[currentQ];
    const progress = ((currentQ + 1) / quizData.length) * 100;
    
    return (
      <div style={styles.container}>
        {/* 顶部状态栏 */}
        <div style={styles.topBar}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>Progress: {currentQ + 1} / 50</span>
            <div style={{ width: '300px', height: '8px', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'var(--cyan-glow)', transition: '0.3s' }}></div>
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: timeLeft < 300 ? 'var(--alert-red)' : 'var(--life-green)', fontFamily: 'monospace' }}>
            ⏳ {formatTime(timeLeft)}
          </div>
        </div>

        {/* 答题区 */}
        <div style={styles.quizArea}>
          <div style={styles.categoryBadge}>{q.category}</div>
          <h2 style={{ fontSize: '20px', color: '#fff', lineHeight: 1.6, marginBottom: '30px' }}>
            {currentQ + 1}. {q.q}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {q.options.map((opt, index) => (
              <div 
                key={index} 
                style={answers[currentQ] === index ? styles.optionSelected : styles.optionCard}
                onClick={() => handleSelect(index)}
              >
                <div style={answers[currentQ] === index ? styles.optionIconSelected : styles.optionIcon}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span style={{ fontSize: '16px' }}>{opt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 底部导航栏 */}
        <div style={styles.bottomBar}>
          <button 
            style={currentQ === 0 ? styles.btnDisabled : styles.btnOutline} 
            onClick={() => setCurrentQ(q => q - 1)} disabled={currentQ === 0}
          >
            ← 上一题
          </button>
          
          {currentQ === quizData.length - 1 ? (
            <button style={styles.btnDanger} onClick={handleSubmit}>交卷并生成报告</button>
          ) : (
            <button style={styles.btnPrimary} onClick={() => setCurrentQ(q => q + 1)}>
              下一题 →
            </button>
          )}
        </div>
      </div>
    );
  }

  // Result Stage
  return (
    <div style={styles.container}>
      <div style={styles.resultHeader}>
        <h1 style={{ color: '#fff', fontSize: '32px', margin: 0 }}>分析报告生成完毕</h1>
        <div style={{ fontSize: '20px', color: score >= 80 ? 'var(--life-green)' : (score >= 60 ? 'var(--alert-orange)' : 'var(--alert-red)') }}>
          总得分: <strong style={{ fontSize: '36px' }}>{score}</strong> / 100
        </div>
      </div>

      <div style={styles.resultLayout}>
        {/* 左侧：能力雷达图 */}
        <div style={styles.radarBox}>
          <h3 style={{ color: 'var(--cyan-glow)', textAlign: 'center', marginBottom: '20px' }}>多维反应基础能力图谱</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarChartData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 13 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="模块得分率(%)" dataKey="score" stroke="var(--cyan-glow)" strokeWidth={2} fill="var(--cyan-glow)" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 右侧：深度复盘解析 (仅显示错题，全对则显示满分鼓励) */}
        <div style={styles.reviewBox}>
          <h3 style={{ color: '#fff', marginTop: 0, borderBottom: '1px solid #334155', paddingBottom: '15px' }}>错题深度复盘</h3>
          <div style={styles.reviewList}>
            {quizData.map((q, idx) => {
              if (answers[idx] === q.ans) return null; // 答对的不显示
              return (
                <div key={idx} style={styles.reviewCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 'bold', color: '#fff' }}>第 {idx + 1} 题 ({q.category})</span>
                    <span style={{ color: 'var(--alert-red)', fontWeight: 'bold' }}>- 2 分</span>
                  </div>
                  <p style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '10px' }}>{q.q}</p>
                  <div style={{ color: 'var(--alert-red)', fontSize: '13px', textDecoration: 'line-through' }}>你的答案: {answers[idx] !== undefined ? q.options[answers[idx]] : "未作答"}</div>
                  <div style={{ color: 'var(--life-green)', fontSize: '13px', fontWeight: 'bold', margin: '5px 0 10px' }}>正确答案: {q.options[q.ans]}</div>
                  <div style={{ background: 'rgba(6,182,212,0.1)', padding: '10px', borderRadius: '6px', fontSize: '13px', color: 'var(--cyan-glow)' }}>
                    💡 <strong>AI导师解析：</strong>{q.exp}
                  </div>
                </div>
              );
            })}
            {score === 100 && (
              <div style={{ textAlign: 'center', color: 'var(--life-green)', fontSize: '18px', padding: '50px 0' }}>
                🎉 满分通过！你的无机化学反应理论已登峰造极！
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 样式系统
// ==========================================
const styles = {
  container: { height: '100%', minHeight: '600px', backgroundColor: 'var(--bg-dark, #0f172a)', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' },
  
  // Start Screen
  startCard: { margin: 'auto', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '16px', padding: '60px 40px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' },
  btnDanger: { background: 'var(--alert-red, #ef4444)', color: '#fff', border: 'none', padding: '15px 40px', fontSize: '18px', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 5px 15px rgba(239, 68, 68, 0.4)', transition: '0.3s' },
  
  // Playing Screen
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', background: '#020617', borderBottom: '1px solid #1e293b' },
  quizArea: { flex: 1, padding: '40px 10%', overflowY: 'auto' },
  categoryBadge: { display: 'inline-block', background: 'rgba(6, 182, 212, 0.2)', color: 'var(--cyan-glow, #06b6d4)', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', marginBottom: '15px', border: '1px solid var(--cyan-glow, #06b6d4)' },
  
  optionCard: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px', background: '#1e293b', border: '2px solid transparent', borderRadius: '10px', color: '#cbd5e1', cursor: 'pointer', transition: 'all 0.2s ease' },
  optionSelected: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px', background: 'rgba(6, 182, 212, 0.1)', border: '2px solid var(--cyan-glow, #06b6d4)', borderRadius: '10px', color: '#fff', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 0 15px rgba(6,182,212,0.2)' },
  
  optionIcon: { width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#334155', borderRadius: '6px', fontWeight: 'bold', color: '#fff' },
  optionIconSelected: { width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cyan-glow, #06b6d4)', borderRadius: '6px', fontWeight: 'bold', color: '#fff' },

  bottomBar: { display: 'flex', justifyContent: 'space-between', padding: '20px 40px', background: '#020617', borderTop: '1px solid #1e293b' },
  btnOutline: { background: 'transparent', border: '1px solid #64748b', color: '#fff', padding: '10px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  btnDisabled: { background: 'transparent', border: '1px solid #334155', color: '#475569', padding: '10px 25px', borderRadius: '8px', cursor: 'not-allowed', fontWeight: 'bold' },
  btnPrimary: { background: 'var(--cyan-glow, #06b6d4)', border: 'none', color: '#fff', padding: '10px 30px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 0 10px rgba(6,182,212,0.4)' },

  // Result Screen
  resultHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '30px 40px', background: '#020617', borderBottom: '1px solid #1e293b' },
  resultLayout: { display: 'flex', flex: 1, overflow: 'hidden' },
  radarBox: { flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #1e293b' },
  reviewBox: { flex: 1.5, padding: '30px 40px', display: 'flex', flexDirection: 'column', background: '#020617' },
  reviewList: { flex: 1, overflowY: 'auto', paddingRight: '15px' },
  reviewCard: { background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '20px', marginBottom: '15px' }
};