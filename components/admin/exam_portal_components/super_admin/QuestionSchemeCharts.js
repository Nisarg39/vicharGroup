import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Color palettes for different chart types
const SUBJECT_COLORS = {
    'Physics': '#3B82F6',      // Blue
    'Chemistry': '#10B981',    // Green  
    'Mathematics': '#F59E0B',  // Amber
    'Biology': '#EF4444'       // Red
};

const SECTION_COLORS = {
    'Section A': '#8B5CF6',    // Purple
    'Section B': '#06B6D4'     // Cyan
};

const DIFFICULTY_COLORS = {
    'Easy': '#10B981',         // Green
    'Medium': '#F59E0B',       // Amber
    'Hard': '#EF4444'          // Red
};

// Custom label function for better readability
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    if (percent < 0.05) return null; // Don't show labels for slices smaller than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text 
            x={x} 
            y={y} 
            fill="white" 
            textAnchor={x > cx ? 'start' : 'end'} 
            dominantBaseline="central"
            fontSize={12}
            fontWeight="500"
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

// Custom tooltip for better information display
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                <p className="font-medium text-gray-900">{data.name}</p>
                <p className="text-sm text-gray-600">Questions: {data.value}</p>
                <p className="text-sm text-gray-600">Percentage: {((data.value / data.total) * 100).toFixed(1)}%</p>
            </div>
        );
    }
    return null;
};

export default function QuestionSchemeCharts({ schemes, selectedScheme }) {
    if (!selectedScheme || !selectedScheme.subjectRules) return null;

    // Group rules by standard (11th and 12th)
    const rulesByStandard = selectedScheme.subjectRules.reduce((acc, rule) => {
        if (!acc[rule.standard]) acc[rule.standard] = [];
        acc[rule.standard].push(rule);
        return acc;
    }, {});

    // Prepare data for subject-wise distribution by class
    const getSubjectDistributionData = (rules) => {
        const total = rules.reduce((sum, rule) => sum + rule.totalQuestions, 0);
        return rules
            .filter(rule => rule.totalQuestions > 0)
            .map(rule => ({
                name: rule.subject,
                value: rule.totalQuestions,
                total: total
            }));
    };

    // Prepare data for JEE section distribution  
    const getSectionDistributionData = (rules) => {
        let sectionATotal = 0;
        let sectionBTotal = 0;
        
        rules.forEach(rule => {
            if (rule.sectionDistribution) {
                sectionATotal += rule.sectionDistribution.sectionA || 0;
                sectionBTotal += rule.sectionDistribution.sectionB || 0;
            }
        });

        const total = sectionATotal + sectionBTotal;
        return [
            { name: 'Section A (MCQ)', value: sectionATotal, total },
            { name: 'Section B (Numerical)', value: sectionBTotal, total }
        ].filter(item => item.value > 0);
    };

    // Prepare data for difficulty distribution
    const getDifficultyDistributionData = (rules) => {
        let easyTotal = 0;
        let mediumTotal = 0;
        let hardTotal = 0;

        rules.forEach(rule => {
            easyTotal += rule.difficultyDistribution.easy || 0;
            mediumTotal += rule.difficultyDistribution.medium || 0;
            hardTotal += rule.difficultyDistribution.hard || 0;
        });

        const total = easyTotal + mediumTotal + hardTotal;
        return [
            { name: 'Easy', value: easyTotal, total },
            { name: 'Medium', value: mediumTotal, total },
            { name: 'Hard', value: hardTotal, total }
        ].filter(item => item.value > 0);
    };

    return (
        <div className="mt-4 space-y-4">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Question Distribution Overview</h3>
            
            {Object.entries(rulesByStandard).map(([standard, rules]) => {
                const subjectData = getSubjectDistributionData(rules);
                const difficultyData = getDifficultyDistributionData(rules);
                const sectionData = selectedScheme.examType === "JEE" ? getSectionDistributionData(rules) : [];
                
                // Skip if no questions for this standard
                if (subjectData.length === 0) return null;

                return (
                    <div key={standard} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-800 mb-3">
                            Class {standard} Distribution 
                            <span className="text-xs text-gray-600 ml-2">
                                (Total: {subjectData.reduce((sum, item) => sum + item.value, 0)} questions)
                            </span>
                        </h4>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Subject-wise Distribution */}
                            <div className="text-center">
                                <h5 className="text-xs font-medium text-gray-700 mb-2">Subject-wise Distribution</h5>
                                <ResponsiveContainer width="100%" height={160}>
                                    <PieChart>
                                        <Pie
                                            data={subjectData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={renderCustomLabel}
                                            outerRadius={55}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {subjectData.map((entry, index) => (
                                                <Cell key={`subject-${index}`} fill={SUBJECT_COLORS[entry.name]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend 
                                            verticalAlign="bottom" 
                                            height={24}
                                            formatter={(value) => <span style={{fontSize: '10px'}}>{value}</span>}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Difficulty-wise Distribution */}
                            {difficultyData.length > 0 && (
                                <div className="text-center">
                                    <h5 className="text-xs font-medium text-gray-700 mb-2">Difficulty Distribution</h5>
                                    <ResponsiveContainer width="100%" height={160}>
                                        <PieChart>
                                            <Pie
                                                data={difficultyData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={renderCustomLabel}
                                                outerRadius={55}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {difficultyData.map((entry, index) => (
                                                    <Cell key={`difficulty-${index}`} fill={DIFFICULTY_COLORS[entry.name]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend 
                                                verticalAlign="bottom" 
                                                height={24}
                                                formatter={(value) => <span style={{fontSize: '10px'}}>{value}</span>}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* JEE Section Distribution */}
                            {selectedScheme.examType === "JEE" && sectionData.length > 0 && (
                                <div className="text-center">
                                    <h5 className="text-xs font-medium text-gray-700 mb-2">Section Distribution</h5>
                                    <ResponsiveContainer width="100%" height={160}>
                                        <PieChart>
                                            <Pie
                                                data={sectionData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={renderCustomLabel}
                                                outerRadius={55}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {sectionData.map((entry, index) => (
                                                    <Cell 
                                                        key={`section-${index}`} 
                                                        fill={entry.name.includes('Section A') ? SECTION_COLORS['Section A'] : SECTION_COLORS['Section B']} 
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend 
                                                verticalAlign="bottom" 
                                                height={24}
                                                formatter={(value) => <span style={{fontSize: '10px'}}>{value}</span>}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>

                        {/* Summary Stats */}
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                            {subjectData.map((item) => (
                                <div key={item.name} className="text-center p-2 bg-white rounded text-xs">
                                    <div 
                                        className="w-3 h-3 rounded-full mx-auto mb-1" 
                                        style={{ backgroundColor: SUBJECT_COLORS[item.name] }}
                                    />
                                    <div className="font-medium text-gray-900">{item.name}</div>
                                    <div className="text-gray-600">{item.value}q</div>
                                    <div className="text-gray-500">
                                        {((item.value / item.total) * 100).toFixed(0)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}