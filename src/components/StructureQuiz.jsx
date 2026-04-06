import React, { useState } from 'react';

const quizQuestions = [
  // ----- 第一章：原子结构 (14题) -----
  {
    question: "1. 描述多电子原子中电子运动状态的四个量子数中，主要决定原子轨道能量的是？",
    options: ["主量子数 n 和角量子数 l", "主量子数 n", "主量子数 n、角量子数 l 和磁量子数 m", "自旋量子数 ms"],
    answer: "主量子数 n 和角量子数 l"
  },
  {
    question: "2. 主量子数 n=3 的电子层，最多能容纳的电子数是？",
    options: ["8", "18", "32", "50"],
    answer: "18"
  },
  {
    question: "3. 下列哪种原子轨道是不存在的？",
    options: ["1s", "2p", "2d", "4f"],
    answer: "2d"
  },
  {
    question: "4. 泡利不相容原理指出？",
    options: ["电子总是尽量成对", "同一原子中不能有两个电子具有完全相同的四个量子数", "体系能量越低越稳定", "电子在简并轨道中尽可能分占不同轨道"],
    answer: "同一原子中不能有两个电子具有完全相同的四个量子数"
  },
  {
    question: "5. 洪特规则(Hund's rule)指出，电子在简并轨道上的排布原则是？",
    options: ["尽可能分占不同轨道，且自旋相反", "尽可能分占不同轨道，且自旋平行", "尽可能成对，自旋平行", "尽可能集中在能量最低的轨道"],
    answer: "尽可能分占不同轨道，且自旋平行"
  },
  {
    question: "6. 铬原子(Cr, 原子序数24)的基态外层电子排布式是？",
    options: ["3d4 4s2", "3d5 4s1", "4s2 4p4", "3d6 4s0"],
    answer: "3d5 4s1"
  },
  {
    question: "7. 铜原子(Cu, 原子序数29)的基态外层电子排布式是？",
    options: ["3d9 4s2", "3d10 4s1", "4s2 4p6", "3d8 4s2 4p1"],
    answer: "3d10 4s1"
  },
  {
    question: "8. 按照玻尔理论，它主要成功解释了下列哪种现象？",
    options: ["光电效应", "多电子原子光谱", "氢原子光谱", "塞曼效应"],
    answer: "氢原子光谱"
  },
  {
    question: "9. 角量子数 l=2 所代表的轨道类型是？",
    options: ["s轨道", "p轨道", "d轨道", "f轨道"],
    answer: "d轨道"
  },
  {
    question: "10. 电子云表示的物理意义是？",
    options: ["电子的运动轨迹", "电子在核外空间某处单位体积内出现的概率密度", "电子的波函数", "电子的电荷分布"],
    answer: "电子在核外空间某处单位体积内出现的概率密度"
  },
  {
    question: "11. 屏蔽效应会导致外层电子感受到的有效核电荷数(Z*)发生什么变化？",
    options: ["增加", "不变", "减小", "先增加后减小"],
    answer: "减小"
  },
  {
    question: "12. 同一周期主族元素中，随着原子序数递增，其第一电离能的总体趋势是？",
    options: ["递增", "递减", "不变", "无规律"],
    answer: "递增"
  },
  {
    question: "13. 钾原子(K, 原子序数19)的基态核外电子排布中最外层电子位于哪种轨道？",
    options: ["3d", "4s", "4p", "3p"],
    answer: "4s"
  },
  {
    question: "14. 根据钻穿效应，主量子数 n 相同时，轨道能量的相对高低顺序为？",
    options: ["ns < np < nd < nf", "ns > np > nd > nf", "ns = np = nd = nf", "nf < nd < np < ns"],
    answer: "ns < np < nd < nf"
  },

  // ----- 第二章：分子结构 (13题) -----
  {
    question: "15. 根据价层电子对互斥理论(VSEPR)，CH4分子的空间构型是？",
    options: ["正四面体", "平面正方形", "三角锥形", "直线形"],
    answer: "正四面体"
  },
  {
    question: "16. 根据VSEPR理论，H2O分子的空间构型及氧原子的杂化轨道类型分别是？",
    options: ["直线形，sp杂化", "V型(折线形)，sp3杂化", "三角锥形，sp2杂化", "正四面体，sp3杂化"],
    answer: "V型(折线形)，sp3杂化"
  },
  {
    question: "17. NH3分子中氮原子采用的杂化方式是？",
    options: ["sp", "sp2", "sp3", "dsp2"],
    answer: "sp3"
  },
  {
    question: "18. CO2分子中碳原子的杂化方式及分子极性分别是？",
    options: ["sp杂化，极性分子", "sp杂化，非极性分子", "sp2杂化，极性分子", "sp2杂化，非极性分子"],
    answer: "sp杂化，非极性分子"
  },
  {
    question: "19. 乙烯分子(C2H4)中，碳碳双键(C=C)包含的键型是？",
    options: ["2个σ键", "2个π键", "1个σ键和1个π键", "1个σ键和2个π键"],
    answer: "1个σ键和1个π键"
  },
  {
    question: "20. 根据分子轨道理论，O2分子呈现顺磁性的原因是由于其分子轨道中含有？",
    options: ["未成对的成键电子", "2个未成对的反键电子", "没有未成对电子", "空轨道"],
    answer: "2个未成对的反键电子"
  },
  {
    question: "21. 根据分子轨道理论，N2分子的键级(Bond Order)是？",
    options: ["1", "2", "3", "4"],
    answer: "3"
  },
  {
    question: "22. 下列分子中，属于非极性分子的是？",
    options: ["H2O", "NH3", "SO2", "CCl4"],
    answer: "CCl4"
  },
  {
    question: "23. 下列分子间作用力中，通常最强的是？",
    options: ["色散力", "诱导力", "取向力", "氢键"],
    answer: "氢键"
  },
  {
    question: "24. BF3分子的空间构型是平面三角形，硼原子的杂化类型是？",
    options: ["sp", "sp2", "sp3", "sp3d"],
    answer: "sp2"
  },
  {
    question: "25. 六氟化硫(SF6)分子中，硫原子的杂化类型为？",
    options: ["sp3", "sp3d", "sp3d2", "d2sp3"],
    answer: "sp3d2"
  },
  {
    question: "26. 分子轨道理论指出，由两个原子轨道线性组合(LCAO)通常能形成几个分子轨道？",
    options: ["1个", "2个", "3个", "4个"],
    answer: "2个"
  },
  {
    question: "27. 在下列化学键中，极性最强的是？",
    options: ["C-H", "N-H", "O-H", "F-H"],
    answer: "F-H"
  },

  // ----- 第三章：配位化合物结构 (13题) -----
  {
    question: "28. 配合物 [Cu(NH3)4]SO4 中，中心离子的配位数是？",
    options: ["2", "4", "5", "6"],
    answer: "4"
  },
  {
    question: "29. 下列配体中，属于多齿配体（螯合剂）的是？",
    options: ["NH3 (氨)", "H2O (水)", "EDTA (乙二胺四乙酸)", "CN- (氰根)"],
    answer: "EDTA (乙二胺四乙酸)"
  },
  {
    question: "30. 配合物 [Co(NH3)5Cl]Cl2 中，存在于外界的离子是？",
    options: ["Co3+", "NH3", "仅内部的Cl-", "外部的两个Cl-"],
    answer: "外部的两个Cl-"
  },
  {
    question: "31. 在 [Co(NH3)5Cl]Cl2 配合物中，中心钴离子的氧化态(化合价)是？",
    options: ["+1", "+2", "+3", "+4"],
    answer: "+3"
  },
  {
    question: "32. 根据晶体场理论，正八面体场中中心离子的5个简并d轨道会分裂为两组，它们是？",
    options: ["t2g(能级低)和eg(能级高)", "t2g(能级高)和eg(能级低)", "a1g和t1u", "e和t2"],
    answer: "t2g(能级低)和eg(能级高)"
  },
  {
    question: "33. 在八面体配合物中，强场配体（如 CN-）通常会导致较大的晶体场分裂能(Δo)，从而形成？",
    options: ["高自旋配合物", "低自旋配合物", "无自旋配合物", "不影响自旋状态"],
    answer: "低自旋配合物"
  },
  {
    question: "34. 弱场配体（如 F- 或 H2O）由于产生的晶体场分裂能(Δo)较小，电子更容易跃迁，通常形成？",
    options: ["低自旋配合物", "高自旋配合物", "顺反异构体", "螯合物"],
    answer: "高自旋配合物"
  },
  {
    question: "35. 配合物中的配位键本质上是指？",
    options: ["配体提供空轨道，中心离子提供孤对电子形成的键", "配体提供孤对电子，中心离子提供空轨道形成的共价键", "静电吸引力", "金属键"],
    answer: "配体提供孤对电子，中心离子提供空轨道形成的共价键"
  },
  {
    question: "36. [Pt(NH3)2Cl2] 存在空间异构现象，主要表现为？",
    options: ["旋光异构", "顺反异构", "电离异构", "键合异构"],
    answer: "顺反异构"
  },
  {
    question: "37. 下列配体中，属于典型的 π酸配体（能接受中心离子的d电子形成反馈π键）的是？",
    options: ["H2O", "NH3", "F-", "CO"],
    answer: "CO"
  },
  {
    question: "38. EDTA 与多数金属离子形成螯合物时，配位数通常是？",
    options: ["2", "4", "6", "8"],
    answer: "6"
  },
  {
    question: "39. 根据光谱化学序列，下列配体产生晶体场分裂能(10Dq)的能力由大到小排序正确的是？",
    options: ["CN- > NH3 > H2O > I-", "I- > H2O > NH3 > CN-", "H2O > CN- > NH3 > I-", "NH3 > CN- > I- > H2O"],
    answer: "CN- > NH3 > H2O > I-"
  },
  {
    question: "40. 配合物 [Fe(CN)6]3- 中 Fe 的化合价为+3 (d5)。由于 CN- 是强场配体，其未成对电子数及磁性为？",
    options: ["5个，顺磁性", "1个，顺磁性", "0个，抗磁性", "3个，顺磁性"],
    answer: "1个，顺磁性"
  }
];

const StructureQuiz = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);

  const handleOptionSelect = (option) => {
    if (!isAnswered) {
      setSelectedOption(option);
    }
  };

  const handleNextQuestion = () => {
    // Check answer and update score
    if (selectedOption === quizQuestions[currentQuestionIndex].answer) {
      setScore(score + 1);
    }

    // Move to next question or end quiz
    const nextQuestion = currentQuestionIndex + 1;
    if (nextQuestion < quizQuestions.length) {
      setCurrentQuestionIndex(nextQuestion);
      setSelectedOption("");
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResults(false);
    setSelectedOption("");
    setIsAnswered(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.quizBox}>
        <h1 style={styles.title}>结构化学章节测试 (单选题 共40题)</h1>
        
        {showResults ? (
          <div style={styles.resultSection}>
            <h2>测试完成！</h2>
            <p style={styles.scoreText}>您的得分是: {score} / {quizQuestions.length}</p>
            <p>准确率: {((score / quizQuestions.length) * 100).toFixed(1)}%</p>
            <button style={styles.button} onClick={restartQuiz}>重新测试</button>
          </div>
        ) : (
          <div>
            <div style={styles.questionSection}>
              <p style={styles.progressText}>进度: {currentQuestionIndex + 1} / {quizQuestions.length}</p>
              <h3 style={styles.questionText}>
                {quizQuestions[currentQuestionIndex].question}
              </h3>
            </div>
            
            <div style={styles.optionsSection}>
              {quizQuestions[currentQuestionIndex].options.map((option, index) => (
                <div 
                  key={index} 
                  onClick={() => handleOptionSelect(option)}
                  style={{
                    ...styles.optionBlock,
                    backgroundColor: selectedOption === option ? '#e0f7fa' : '#ffffff',
                    borderColor: selectedOption === option ? '#00acc1' : '#ccc'
                  }}
                >
                  {option}
                </div>
              ))}
            </div>
            
            <button 
              style={{...styles.button, opacity: selectedOption ? 1 : 0.5}} 
              onClick={handleNextQuestion}
              disabled={!selectedOption}
            >
              {currentQuestionIndex === quizQuestions.length - 1 ? '提交考卷' : '下一题'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// 基础 CSS 内联样式，确保在 VS code 以及浏览器中表现良好
const styles = {
  container: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    display: 'flex',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh'
  },
  quizBox: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    maxWidth: '800px',
    width: '100%'
  },
  title: {
    textAlign: 'center',
    color: '#333',
    borderBottom: '2px solid #eee',
    paddingBottom: '10px',
    marginBottom: '20px'
  },
  progressText: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '10px'
  },
  questionText: {
    fontSize: '18px',
    color: '#222',
    lineHeight: '1.5',
    marginBottom: '20px'
  },
  optionsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px'
  },
  optionBlock: {
    padding: '12px 15px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '16px'
  },
  button: {
    display: 'block',
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '20px'
  },
  resultSection: {
    textAlign: 'center',
    padding: '20px'
  },
  scoreText: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#007bff',
    margin: '15px 0'
  }
};

export default StructureQuiz;