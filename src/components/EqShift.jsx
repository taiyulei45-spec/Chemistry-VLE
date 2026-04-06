import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import * as echarts from 'echarts';
// 在 src/components/EqShift.jsx 的顶部
import "../App.css";

// 🗄️ JSON Schema: 静态数据库配置 [cite: 41, 42, 46]
const DATABASE = {
    metals: [
        { id: "La", name: "镧" }, { id: "Ce", name: "铈" },
        { id: "Pr", name: "镨" }, { id: "Nd", name: "钕" },
        { id: "Gd", name: "钆" }, { id: "Lu", name: "镥" }
    ],
    ligands: [
        { id: "LIG_CIT", name: "柠檬酸", type: "水相掩蔽剂", denticity: "3齿", pKa: [3.13, 4.76, 6.40], logKf: { La: 7.6, Ce: 7.8, Pr: 7.9, Nd: 8.0, Gd: 8.2, Lu: 8.6 }, feedbackMsg: "齿数较少，包围不全，虽然重稀土结合力略强，但整体分离系数极低。" },
        { id: "LIG_EDTA", name: "EDTA", type: "水相掩蔽剂", denticity: "6齿", pKa: [0.9, 1.6, 2.0, 2.67, 6.16, 10.26], logKf: { La: 15.5, Ce: 15.98, Pr: 16.4, Nd: 16.6, Gd: 17.3, Lu: 19.8 }, feedbackMsg: "经典六齿，绝对稳定性强，但面对轻稀土间微小的半径变化，识别敏感度依然不足。" },
        { id: "LIG_DTPA", name: "DTPA", type: "水相掩蔽剂", denticity: "8齿", pKa: [1.5, 2.0, 2.68, 4.28, 8.60, 10.58], logKf: { La: 19.48, Ce: 20.4, Pr: 21.1, Nd: 21.6, Gd: 22.46, Lu: 22.44 }, feedbackMsg: "黄金八齿！位阻完美契合轻稀土的镧系收缩。注意：对重稀土(Lu)因空间拥挤导致稳定常数反常下降。" },
        { id: "LIG_TTHA", name: "TTHA", type: "水相掩蔽剂", denticity: "10齿", pKa: [2.4, 2.8, 4.1, 6.2, 9.4, 10.2], logKf: { La: 22.5, Ce: 22.9, Pr: 23.2, Nd: 23.4, Gd: 23.0, Lu: 22.0 }, feedbackMsg: "位阻过载！十齿配体极其拥挤，面对较小的重稀土离子时，内部排斥导致配位键强度断崖式下降。" },
        { id: "LIG_P507", name: "P507", type: "有机萃取剂", denticity: "磷酸酯", pKa: [3.0], logKf: { La: 12.0, Ce: 12.6, Pr: 13.0, Nd: 13.4, Gd: 14.5, Lu: 16.0 }, feedbackMsg: "中国稀土工业的主力王牌！具备优良的萃取选择性，准备通过工程级联见证奇迹！" }
    ]
};

const THRESHOLD = 7.0; // Sigmoid 50% 络合阈值 [cite: 48]

// 纯函数：底层酸效应计算 [cite: 66, 67, 70]
const calculateConditionalKf = (pH, logKfAbsolute, pKaArray) => {
    const H_ion_conc = Math.pow(10, -pH);
    let alpha_YH = 1.0;
    const reversed_pKa = [...pKaArray].sort((a, b) => b - a);
    let current_Ka_product = 1.0;
    for (let i = 0; i < reversed_pKa.length; i++) {
        const Ka = Math.pow(10, -reversed_pKa[i]);
        current_Ka_product *= Ka;
        const term = Math.pow(H_ion_conc, i + 1) / current_Ka_product;
        alpha_YH += term;
    }
    return logKfAbsolute - Math.log10(alpha_YH);
};

// 纯函数：分布百分比映射 (Sigmoid) [cite: 71, 74]
const calculateDistribution = (pH, kfTarget, kfImpurity, pKaArray) => {
    const primeT = calculateConditionalKf(pH, kfTarget, pKaArray);
    const primeI = calculateConditionalKf(pH, kfImpurity, pKaArray);
    const pTarget = (Math.pow(10, primeT - THRESHOLD) / (1 + Math.pow(10, primeT - THRESHOLD))) * 100;
    const pImpurityComplex = (Math.pow(10, primeI - THRESHOLD) / (1 + Math.pow(10, primeI - THRESHOLD))) * 100;
    return { pTarget, pImpurityFree: 100 - pImpurityComplex };
};

export default function RareEarthSeparation() {
    // 📝 核心状态层 (State) [cite: 47, 48]
    const [userState, setUserState] = useState({
        metal1Id: "La",
        metal2Id: "Ce",
        activeLigandId: "LIG_DTPA",
        currentPh: 6.5,
        cascadeN: 1
    });

    const chartContainerRef = useRef(null);
    const chartInstanceRef = useRef(null);

    // 🧠 计算引擎层 (Computed State)
    const activeLigandDef = useMemo(() => 
        DATABASE.ligands.find(l => l.id === userState.activeLigandId)
    , [userState.activeLigandId]);

    const getDeltaKfDisplay = useCallback((ligand) => {
        const kf1 = ligand.logKf[userState.metal1Id] || 0;
        const kf2 = ligand.logKf[userState.metal2Id] || 0;
        return Math.abs(kf1 - kf2);
    }, [userState.metal1Id, userState.metal2Id]);

    const computedState = useMemo(() => {
        const lig = activeLigandDef;
        const m1 = userState.metal1Id;
        const m2 = userState.metal2Id;
        
        const kf1 = lig.logKf[m1] || 0;
        const kf2 = lig.logKf[m2] || 0;
        
        const processThermodynamics = (targetId, impurityId, kfTarget, kfImpurity) => {
            const kfPrimeTarget = calculateConditionalKf(userState.currentPh, kfTarget, lig.pKa);
            const kfPrimeImpurity = calculateConditionalKf(userState.currentPh, kfImpurity, lig.pKa);
            
            const delta = Math.abs(kfTarget - kfImpurity);
            const isCollapse = kfPrimeTarget < 4.5; // 崩溃阈值 [cite: 55, 56]
            
            let purity = 0;
            if (!isCollapse && delta > 0) {
                const beta = Math.pow(10, delta);
                const a = 0.4;
                const maxBetaEffect = Math.pow(beta, userState.cascadeN);
                if (maxBetaEffect > 1e15) {
                    purity = 99.9999;
                } else {
                    purity = 100 * (1 - (1 / (1 + a * maxBetaEffect)));
                }
            } else if (!isCollapse && delta === 0) {
                purity = 50.0;
            }
            purity = Math.min(purity, 99.9999);

            return {
                thermodynamics: { targetMetal: targetId, impurityMetal: impurityId, kfPrimeTarget, kfPrimeImpurity, deltaLogKf: delta },
                alerts: { isAcidCollapse: isCollapse, alertMessage: isCollapse ? "配位网络崩溃" : "系统环境稳定" },
                results: { finalPurity: purity, isMiracleAchieved: purity >= 99.99 }
            };
        };

        if (m1 === m2) {
            return processThermodynamics(m1, m1, kf1, kf1);
        }

        const isM1Target = kf1 >= kf2;
        return processThermodynamics(
            isM1Target ? m1 : m2,
            isM1Target ? m2 : m1,
            isM1Target ? kf1 : kf2,
            isM1Target ? kf2 : kf1
        );
    }, [activeLigandDef, userState.metal1Id, userState.metal2Id, userState.currentPh, userState.cascadeN]);

    // 重置推杆事件侦听机制 [cite: 94]
    useEffect(() => {
        setUserState(prev => ({ ...prev, cascadeN: 1 }));
    }, [userState.activeLigandId, userState.metal1Id, userState.metal2Id]);

    // 🎨 ECharts 初始化与自适应 [cite: 76, 95]
    useEffect(() => {
        if (chartContainerRef.current) {
            chartInstanceRef.current = echarts.init(chartContainerRef.current, 'dark', { renderer: 'canvas' });
        }
        const handleResize = () => chartInstanceRef.current?.resize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            chartInstanceRef.current?.dispose();
        };
    }, []);

    const getMarkLineGraphic = useCallback((pH, isAlert) => {
        const ratio = (pH - 1) / 13;
        const leftPercent = 8 + (ratio * 87); 
        return {
            type: 'group', id: 'phIndicator',
            children: [{
                type: 'line', left: `${leftPercent}%`, shape: { x1: 0, y1: 30, x2: 0, y2: 800 },
                style: { stroke: isAlert ? '#ef4444' : '#10b981', lineWidth: 2, lineDash: [8, 4] }, z: 100
            }]
        };
    }, []);

    // 绘制主图表 [cite: 78, 89]
    useEffect(() => {
        if (!chartInstanceRef.current) return;

        const xData = [], targetData = [], impurityData = [];
        const lig = activeLigandDef;
        const m1 = userState.metal1Id;
        const m2 = userState.metal2Id;
        const kf1 = lig.logKf[m1] || 0; 
        const kf2 = lig.logKf[m2] || 0;
        const kfT = Math.max(kf1, kf2);
        const kfI = Math.min(kf1, kf2);

        for (let i = 10; i <= 140; i++) {
            const pH = i / 10;
            xData.push(pH.toFixed(1));
            if (kfT === kfI && m1 === m2) {
                targetData.push(0);
                impurityData.push(0);
            } else {
                const dist = calculateDistribution(pH, kfT, kfI, lig.pKa);
                targetData.push(dist.pTarget.toFixed(2));
                impurityData.push(dist.pImpurityFree.toFixed(2));
            }
        }

        const tName = computedState.thermodynamics.targetMetal;
        const iName = computedState.thermodynamics.impurityMetal;

        const option = {
            backgroundColor: 'transparent',
            tooltip: { 
                trigger: 'axis', backgroundColor: 'rgba(10,13,20,0.9)', borderColor: '#1e293b', textStyle: {color: '#cbd5e1'},
                formatter: (p) => `<div class="font-bold border-b border-gray-700 pb-1 mb-1 text-white">pH: ${p[0].axisValue}</div>
                                   <span class="text-amber-400">●</span> ${p[0].seriesName}: ${p[0].data}%<br/>
                                   <span class="text-cyan-400">●</span> ${p[1].seriesName}: ${p[1].data}%`
            },
            legend: { data: [`${tName}³⁺ 络合提取率`, `${iName}³⁺ 游离保留率`], top: 0, textStyle: {color: '#94a3b8', fontSize: 13, fontWeight: 'bold'} },
            grid: { top: '15%', left: '8%', right: '5%', bottom: '15%' },
            xAxis: { type: 'category', data: xData, axisLabel: { interval: 9, color: '#64748b' } },
            yAxis: { type: 'value', max: 100, min: 0, splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } } },
            series: [
                { name: `${tName}³⁺ 络合提取率`, type: 'line', smooth: true, symbol: 'none', lineStyle: { width: 4, color: '#fbbf24', shadowColor: 'rgba(251,191,36,0.5)', shadowBlur: 15 }, data: targetData },
                { name: `${iName}³⁺ 游离保留率`, type: 'line', smooth: true, symbol: 'none', lineStyle: { width: 4, color: '#22d3ee', shadowColor: 'rgba(34,211,238,0.5)', shadowBlur: 15 }, data: impurityData }
            ],
            graphic: getMarkLineGraphic(userState.currentPh, computedState.alerts.isAcidCollapse)
        };
        
        chartInstanceRef.current.setOption(option, true);
    }, [activeLigandDef, userState.metal1Id, userState.metal2Id, computedState.thermodynamics.targetMetal, computedState.thermodynamics.impurityMetal]);

    // 单独监控 pH 变化，仅更新标尺线以提升性能 [cite: 89, 90]
    useEffect(() => {
        if(chartInstanceRef.current) {
            chartInstanceRef.current.setOption({ graphic: getMarkLineGraphic(userState.currentPh, computedState.alerts.isAcidCollapse) });
        }
    }, [userState.currentPh, computedState.alerts.isAcidCollapse, getMarkLineGraphic]);

    const isAlert = computedState.alerts.isAcidCollapse;

    // DOM 渲染映射 [cite: 12, 14, 15, 20, 29]
    return (
        <div className={`flex-1 flex flex-col h-screen transition-colors duration-300 ${isAlert ? 'glitch-alert bg-red-950' : 'bg-[#0b0f19]'}`}>
            
            <header className="bg-gray-900/90 backdrop-blur border-b border-gray-800 p-4 flex justify-between items-center z-30 shadow-lg">
                <div>
                    <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 tracking-tight">
                        CoordiMatrix Pro <span className="text-xs text-gray-400 ml-2 border border-gray-700 px-2 py-1 rounded bg-gray-800">v2.0 旗舰版 (React)</span>
                    </h1>
                    <p className="text-[11px] text-gray-500 mt-1 font-mono tracking-widest uppercase">致敬徐光宪院士 · 用中国算式破解世界级分离难题</p>
                </div>
                <div className="text-right flex items-center gap-4">
                    {isAlert ? (
                        <div className="text-red-400 font-bold animate-pulse bg-red-900/40 px-4 py-2 rounded border border-red-700 glitch-text">
                            ⚠️ {computedState.alerts.alertMessage}
                        </div>
                    ) : (
                        <div className="text-emerald-400 font-bold bg-emerald-900/20 px-4 py-2 rounded border border-emerald-800/50">
                            ✓ {computedState.alerts.alertMessage}
                        </div>
                    )}
                </div>
            </header>

            <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden relative">
                
                {isAlert && (
                    <div className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-center bg-red-950/60 backdrop-blur-sm">
                        <div className="text-7xl mb-4 text-red-500 font-black tracking-widest glitch-text animate-bounce">H⁺ 暴力轰击</div>
                        <p className="text-2xl text-red-200 font-bold bg-black/50 px-6 py-2 rounded">配位网络已彻底解体，金属离子全部游离！</p>
                    </div>
                )}

                {/* 左侧面板 */}
                <div className="col-span-3 bg-[#0f1423] border-r border-gray-800 p-6 flex flex-col gap-6 z-10 shadow-2xl overflow-y-auto">
                    <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700">
                        <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-4 font-bold"><span className="text-blue-500 mr-2">▶</span>1. 元素靶场 (对决组合)</h2>
                        <div className="flex gap-2 items-center">
                            <select 
                                value={userState.metal1Id} 
                                onChange={(e) => setUserState({...userState, metal1Id: e.target.value})}
                                className="w-[42%] bg-gray-900 border border-gray-600 rounded p-2 text-white font-mono text-center focus:border-blue-500 outline-none"
                            >
                                {DATABASE.metals.map(m => <option key={`m1-${m.id}`} value={m.id}>{m.id}³⁺</option>)}
                            </select>
                            <div className="w-[16%] text-center text-gray-600 font-black text-sm">VS</div>
                            <select 
                                value={userState.metal2Id} 
                                onChange={(e) => setUserState({...userState, metal2Id: e.target.value})}
                                className="w-[42%] bg-gray-900 border border-gray-600 rounded p-2 text-white font-mono text-center focus:border-cyan-500 outline-none"
                            >
                                {DATABASE.metals.map(m => <option key={`m2-${m.id}`} value={m.id}>{m.id}³⁺</option>)}
                            </select>
                        </div>
                        {userState.metal1Id === userState.metal2Id && (
                            <div className="mt-2 text-[10px] text-red-400 text-center">无法分离同种元素，请重新选择！</div>
                        )}
                    </div>

                    <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700 flex-1 flex flex-col">
                        <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-4 font-bold"><span className="text-purple-500 mr-2">▶</span>2. 试剂武库 (配体选择)</h2>
                        <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto pr-1">
                            {DATABASE.ligands.map(ligand => (
                                <div 
                                    key={ligand.id} 
                                    onClick={() => setUserState({...userState, activeLigandId: ligand.id})}
                                    className={`border border-gray-700 rounded-lg p-3 cursor-pointer transition-all hover:bg-gray-700 relative overflow-hidden bg-gray-900 ${userState.activeLigandId === ligand.id ? 'card-active' : ''}`}
                                >
                                    {userState.activeLigandId === ligand.id && <div className="absolute -right-5 -top-5 w-10 h-10 bg-blue-500 rotate-45"></div>}
                                    <div className="font-bold text-gray-200 text-sm">{ligand.name}</div>
                                    <div className="text-[10px] text-gray-500 mt-1">{ligand.type} | {ligand.denticity}</div>
                                    <div className="text-xs mt-3 font-mono text-cyan-400">ΔlogKf: {getDeltaKfDisplay(ligand).toFixed(2)}</div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 p-3 rounded bg-[#0a0d14] border border-blue-900/50 text-gray-300 text-xs leading-relaxed shadow-inner">
                            <span className="text-blue-400 font-bold mr-1">🤖 AI评估:</span>
                            {activeLigandDef.feedbackMsg}
                        </div>
                    </div>

                    <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700">
                        <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-4 font-bold"><span className="text-yellow-500 mr-2">▶</span>3. 大国重器 (萃取级数 N)</h2>
                        <div className="flex justify-between text-xs text-gray-500 mb-3 font-mono">
                            <span>N=1</span>
                            <span className="text-yellow-400 font-bold text-sm bg-yellow-900/30 px-2 rounded border border-yellow-700/50">N = {userState.cascadeN}</span>
                            <span>N=100</span>
                        </div>
                        <input 
                            type="range" 
                            value={userState.cascadeN} 
                            min="1" max="100" 
                            onChange={(e) => setUserState({...userState, cascadeN: Number(e.target.value)})}
                            className="w-full h-3 bg-gray-900 rounded-lg appearance-none border border-gray-700 shadow-inner" 
                        />
                    </div>
                </div>

                {/* 中间图表区 */}
                <div className="col-span-6 flex flex-col relative bg-[#060913] z-10 border-r border-gray-800 shadow-2xl">
                    <div className="p-6 absolute top-0 left-0 right-0 flex justify-between z-20 pointer-events-none">
                        <h2 className="text-sm uppercase tracking-widest text-gray-400 drop-shadow-md font-bold">X 型动态分离寻优图</h2>
                        <div className="text-xs bg-gray-900/80 backdrop-blur px-4 py-1.5 rounded-full border border-gray-700 text-gray-300 flex gap-4">
                            <span>体系配体: <span className="text-purple-400 font-bold">{activeLigandDef.name}</span></span>
                            <span>目标(强): <span className="text-amber-400 font-bold">{computedState.thermodynamics.targetMetal}³⁺</span></span>
                            <span>杂质(弱): <span className="text-blue-400 font-bold">{computedState.thermodynamics.impurityMetal}³⁺</span></span>
                        </div>
                    </div>
                    
                    <div ref={chartContainerRef} className={`flex-1 w-full mt-12 transition-all duration-300 ${isAlert ? 'opacity-10 blur-md grayscale' : ''}`}></div>

                    <div className="h-32 bg-[#0a0d14] border-t border-gray-800 p-8 flex flex-col justify-center shadow-[0_-15px_30px_rgba(0,0,0,0.6)] z-20">
                        <div className="flex justify-between items-center mb-5">
                            <span className="text-sm font-bold text-gray-400 tracking-wide">调节 pH 寻找最佳“X型穹顶”交叉点</span>
                            <span className={`text-4xl font-black font-mono tracking-tighter ${isAlert ? 'text-red-500 glitch-text' : 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]'}`}>
                                {userState.currentPh.toFixed(1)}
                            </span>
                        </div>
                        <input 
                            type="range" 
                            value={userState.currentPh} 
                            min="1" max="14" step="0.1" 
                            onChange={(e) => setUserState({...userState, currentPh: Number(e.target.value)})}
                            className="w-full h-3 bg-gray-800 rounded-lg appearance-none border border-gray-700" 
                        />
                    </div>
                </div>

                {/* 右侧结果区 */}
                <div className="col-span-3 bg-[#0f1423] flex flex-col relative">
                    <div className="p-8 border-b border-gray-800 bg-[#0a0d14] relative overflow-hidden shadow-2xl h-[35%] flex flex-col justify-center">
                        <div className="absolute -right-10 -top-10 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl"></div>
                        {computedState.results.isMiracleAchieved && <div className="absolute inset-0 bg-yellow-500/10 animate-pulse"></div>}

                        <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4 z-10">{computedState.thermodynamics.targetMetal}³⁺ 目标相最终纯度</h2>
                        
                        <div className="flex items-baseline gap-2 z-10">
                            <div className={`text-7xl font-black font-mono tracking-tighter transition-all duration-500 ${computedState.results.isMiracleAchieved ? 'gold-glow' : 'text-gray-100'}`}>
                                {computedState.results.finalPurity.toFixed(4)}
                            </div>
                            <div className="text-2xl text-gray-600 font-bold">%</div>
                        </div>

                        <div className="h-12 mt-6 z-10">
                            {computedState.results.isMiracleAchieved && (
                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-yellow-400 text-yellow-950 font-black px-4 py-2 rounded-lg text-sm shadow-[0_0_20px_rgba(250,204,21,0.6)] animate-bounce border border-yellow-200">
                                    🏆 徐光宪串级奇迹复现者
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 p-6 flex flex-col items-center justify-center bg-[#050810] relative overflow-hidden">
                        <h2 className="text-[10px] uppercase tracking-widest text-gray-600 absolute top-4 left-4 font-bold">全自动化萃取槽阵列 (俯视图)</h2>
                        
                        <div className="w-full h-full flex items-center justify-center pt-8">
                            <div className="flex flex-wrap justify-center gap-[2px] w-full transition-transform duration-1000" style={{ transform: `scale(${Math.max(0.4, 1 - userState.cascadeN*0.005)})` }}>
                                {Array.from({ length: Math.min(userState.cascadeN, 100) }).map((_, i) => (
                                    <div key={`tank-${i}`} className="w-5 h-16 bg-gray-900 border border-gray-700 rounded-sm relative overflow-hidden flex flex-col shadow-2xl">
                                        <div className={`flex-1 flow-anim border-b border-black/50 ${isAlert ? 'bg-red-900/40' : 'bg-amber-500/80 bg-gradient-to-r from-amber-600 to-amber-400'}`}></div>
                                        <div className={`flex-1 flow-anim ${isAlert ? 'bg-red-900/40' : 'bg-cyan-600/80 bg-gradient-to-r from-cyan-700 to-cyan-500'}`}></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="absolute bottom-6 left-0 right-0 px-6 text-center z-10 bg-black/40 py-2 backdrop-blur-sm">
                            <p className="text-[11px] text-gray-400 leading-relaxed">
                                宏观级联放大效应：<br/>
                                单槽微小优势被放大了 <span className="text-cyan-400 font-bold font-mono text-sm pl-1">10<sup className="text-[10px]">({(computedState.thermodynamics.deltaLogKf).toFixed(2)} × {userState.cascadeN})</sup></span> 倍
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}