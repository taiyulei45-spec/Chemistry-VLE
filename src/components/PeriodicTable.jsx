import React, { useState } from 'react';
import { elementData } from '../data/elements';

export default function PeriodicTable({ onSelectElement }) {
  // 定义显示哪种属性：radius, electronegativity, ionization, affinity
  const [displayProp, setDisplayProp] = useState('electronegativity');

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        {['radius', 'electronegativity', 'ionization', 'affinity'].map(prop => (
          <button 
            key={prop}
            onClick={() => setDisplayProp(prop)}
            style={{
              ...styles.propBtn,
              backgroundColor: displayProp === prop ? '#2563eb' : '#334155'
            }}
          >
            {prop === 'radius' ? '原子半径' : 
             prop === 'electronegativity' ? '电负性' : 
             prop === 'ionization' ? '第一电离能' : '电子亲合能'}
          </button>
        ))}
      </div>

      <div style={styles.grid}>
        {elementData.map(el => (
          <div 
            key={el.number}
            onClick={() => onSelectElement(el)}
            style={{
              ...styles.elementCard,
              gridColumn: el.group, // 关键：根据族决定列
              gridRow: el.period,    // 关键：根据周期决定行
              borderColor: getBlockColor(el.block)
            }}
          >
            <span style={styles.elNumber}>{el.number}</span>
            <strong style={styles.elSymbol}>{el.symbol}</strong>
            <span style={styles.elProp}>{el[displayProp] || '-'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 根据分区返回颜色
const getBlockColor = (block) => {
  const colors = { s: '#3b82f6', p: '#ef4444', d: '#f59e0b', f: '#10b981' };
  return colors[block] || '#ccc';
};

const styles = {
  container: { padding: '1rem', width: '100%', overflowX: 'auto' },
  toolbar: { marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' },
  propBtn: { padding: '0.4rem 0.8rem', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(18, minmax(50px, 1fr))', // 18列布局
    gridTemplateRows: 'repeat(7, 65px)',                // 7个周期
    gap: '4px',
    minWidth: '1000px'
  },
  elementCard: {
    border: '2px solid',
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backgroundColor: '#1e293b',
    color: 'white',
    transition: 'transform 0.1s',
    ':hover': { transform: 'scale(1.1)', zIndex: 10 }
  },
  elNumber: { fontSize: '0.6rem', alignSelf: 'flex-start', marginLeft: '3px' },
  elSymbol: { fontSize: '1.1rem' },
  elProp: { fontSize: '0.65rem', color: '#94a3b8' }
};