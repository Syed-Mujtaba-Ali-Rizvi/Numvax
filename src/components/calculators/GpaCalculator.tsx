'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { GpaScaleMeter } from '../visualization/GpaScaleMeter';
import { CalculatorHistory, saveCalculationHistory } from '../calculator/CalculatorHistory';
import { calculateGpa, STANDARD_4_0_SCALE } from '../../lib/engine/calculators/gpa';
import { CustomGpaScaleItem, GpaCourse, GpaResult } from '../../lib/engine/types';
import { Plus, Trash2, GraduationCap, Settings2, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';

const INITIAL_COURSES: GpaCourse[] = [
  { id: '1', name: 'Course 1', creditHours: 3, grade: 'A' },
  { id: '2', name: 'Course 2', creditHours: 4, grade: 'A-' },
  { id: '3', name: 'Course 3', creditHours: 3, grade: 'B+' },
  { id: '4', name: 'Course 4', creditHours: 2, grade: 'A' },
];

export const GpaCalculator: React.FC = () => {
  const t = useTranslations('gpaTool');
  const tCommon = useTranslations('common');

  const [courses, setCourses] = useState<GpaCourse[]>(INITIAL_COURSES);
  const [useCustomScale, setUseCustomScale] = useState(false);
  const [maxScale, setMaxScale] = useState('4.0');
  const [customScaleItems, setCustomScaleItems] = useState<CustomGpaScaleItem[]>([
    { letter: 'A', points: 4.0 },
    { letter: 'B', points: 3.0 },
    { letter: 'C', points: 2.0 },
    { letter: 'D', points: 1.0 },
    { letter: 'F', points: 0.0 },
  ]);

  const [result, setResult] = useState<GpaResult | null>(null);

  useEffect(() => {
    const res = calculateGpa({
      courses,
      useCustomScale,
      maxScale: Number(maxScale) || 4.0,
      customScaleItems,
    });

    if (res.success && res.data) {
      setResult(res.data);
      saveCalculationHistory('gpa-calculator', 'GPA Calculator', res.summary || `GPA: ${res.data.gpa}`);
    }
  }, [courses, useCustomScale, maxScale, customScaleItems]);

  const addCourse = () => {
    const newId = Date.now().toString();
    setCourses([...courses, { id: newId, name: `${t('courseName')} ${courses.length + 1}`, creditHours: 3, grade: 'A' }]);
  };

  const removeCourse = (id: string) => {
    if (courses.length <= 1) return;
    setCourses(courses.filter((c) => c.id !== id));
  };

  const updateCourse = (id: string, field: keyof GpaCourse, value: any) => {
    setCourses(courses.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const handleReset = () => {
    setCourses(INITIAL_COURSES);
    setUseCustomScale(false);
    setMaxScale('4.0');
  };

  return (
    <Card className="calculator-card flex flex-col gap-6">
      {/* Custom Grading Scale Toggle Banner */}
      <div className="flex items-center justify-between p-3.5 bg-[#F5F2EB] rounded-2xl border border-neutral-200/80">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-neutral-700" />
          <span className="text-xs font-bold text-neutral-800">
            Scale Mode: {useCustomScale ? 'Custom User-Defined Scale' : 'Standard 4.0 Scale'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setUseCustomScale(!useCustomScale)}
          className="text-xs font-bold text-neutral-900 hover:underline cursor-pointer"
        >
          {useCustomScale ? 'Switch to Standard 4.0 Scale' : 'Customize Grading Scale'}
        </button>
      </div>

      {/* Two-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Course Entry Matrix */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              {t('courseName')} ({courses.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={addCourse}
                className="px-2.5 py-1 bg-neutral-900 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" /> {t('addCourse')}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> {tCommon('reset')}
              </button>
            </div>
          </div>

          {/* Matrix Header */}
          <div className="grid grid-cols-12 gap-2 px-2 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
            <div className="col-span-5">{t('courseName')}</div>
            <div className="col-span-3">{t('credits')}</div>
            <div className="col-span-3">{t('grade')}</div>
            <div className="col-span-1 text-right">Del</div>
          </div>

          {/* Course Rows */}
          <div className="flex flex-col gap-2.5">
            {courses.map((course, idx) => (
              <div
                key={course.id}
                className="grid grid-cols-12 gap-2 items-center p-2.5 bg-[#FBF9F5] border border-neutral-200/80 rounded-2xl shadow-2xs"
              >
                <div className="col-span-5">
                  <input
                    type="text"
                    placeholder={`${t('courseName')} ${idx + 1}`}
                    value={course.name}
                    onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-xl font-medium text-neutral-900"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    placeholder={t('credits')}
                    value={course.creditHours}
                    onChange={(e) => updateCourse(course.id, 'creditHours', Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-xl font-bold font-mono text-neutral-900"
                  />
                </div>
                <div className="col-span-3">
                  <select
                    value={course.grade}
                    onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-xl font-bold text-neutral-900"
                  >
                    {Object.entries(STANDARD_4_0_SCALE).map(([letter, points]) => (
                      <option key={letter} value={letter}>
                        {letter} ({points.toFixed(1)})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => removeCourse(course.id)}
                    disabled={courses.length <= 1}
                    className="p-1 text-neutral-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Visual Result Card */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            {t('cumulativeGpa')}
          </span>

          {result ? (
            <div className="flex flex-col p-6 bg-[#FAF8F5] border border-neutral-200/80 rounded-3xl gap-6 shadow-2xs text-center">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  {t('cumulativeGpa')}
                </span>
                <div className="text-6xl font-black text-neutral-900 tracking-tight font-serif">
                  {result.gpa.toFixed(2)}
                </div>
                <span className="text-xs font-bold text-neutral-600">
                  {t('totalCredits')}: {result.totalCreditHours} | {t('gradePoints')}: {result.totalGradePoints.toFixed(1)}
                </span>
              </div>

              <GpaScaleMeter
                gpa={result.gpa}
                maxScale={result.maxScale}
                totalCreditHours={result.totalCreditHours}
                totalGradePoints={result.totalGradePoints}
              />
            </div>
          ) : (
            <div className="p-8 text-center bg-[#FAF8F5] border border-neutral-200/80 rounded-3xl text-neutral-500 text-xs font-medium">
              Enter your course credits and grades to calculate cumulative GPA.
            </div>
          )}
        </div>
      </div>

      <CalculatorHistory slug="gpa-calculator" />
    </Card>
  );
};
