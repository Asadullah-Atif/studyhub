'use client';

import { useState } from 'react';
import {
  BarChart3, Plus, Trash2, Edit2, TrendingUp, Award,
  Target, Calendar
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { getLetterGrade } from '../../lib/store';
import { useToast } from '../../lib/toast';
import { Card, Button, Input, Select, Badge, EmptyState, ProgressBar } from '../../components/ui';
import { Modal, ConfirmModal } from '../../components/Modal';
import { generateId, formatDate, cn } from '../../lib/utils';
import { Grade } from '../../lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function GradesPage() {
  const { subjects, grades, addGrade, updateGrade, deleteGrade, addActivity, getCumulativeGPA, getSubjectGPA } = useStore();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [formData, setFormData] = useState({
    subjectId: '',
    title: '',
    score: 0,
    maxMarks: 100,
    weightage: 10,
    date: new Date().toISOString().split('T')[0],
    semester: '',
  });

  const semesters = [...new Set(grades.map(g => g.semester).filter(Boolean))];

  const filteredGrades = selectedSemester === 'all' 
    ? grades 
    : grades.filter(g => g.semester === selectedSemester);

  const cumulativeGPA = getCumulativeGPA();

  const handleSubmit = () => {
    if (!formData.subjectId || !formData.title || formData.score < 0 || formData.maxMarks <= 0) {
      showToast('error', 'Please fill in all required fields correctly');
      return;
    }

    const percentage = (formData.score / formData.maxMarks) * 100;
    const gradeData: Grade = {
      id: editingGrade?.id || generateId(),
      subjectId: formData.subjectId,
      title: formData.title,
      score: formData.score,
      maxMarks: formData.maxMarks,
      weightage: formData.weightage,
      date: formData.date,
      semester: formData.semester || undefined,
      createdAt: editingGrade?.createdAt || new Date().toISOString(),
    };

    if (editingGrade) {
      updateGrade(editingGrade.id, gradeData);
      showToast('success', 'Grade updated');
    } else {
      addGrade(gradeData);
      showToast('success', 'Grade added');
      addActivity({
        id: generateId(),
        type: 'grade',
        action: 'added',
        description: `Added grade: ${gradeData.title} - ${percentage.toFixed(1)}%`,
        timestamp: new Date().toISOString(),
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setEditingGrade(null);
    setFormData({
      subjectId: '',
      title: '',
      score: 0,
      maxMarks: 100,
      weightage: 10,
      date: new Date().toISOString().split('T')[0],
      semester: '',
    });
  };

  const handleEdit = (grade: Grade) => {
    setEditingGrade(grade);
    setFormData({
      subjectId: grade.subjectId,
      title: grade.title,
      score: grade.score,
      maxMarks: grade.maxMarks,
      weightage: grade.weightage,
      date: grade.date,
      semester: grade.semester || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteGrade(id);
    setDeleteId(null);
    showToast('success', 'Grade deleted');
  };

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || 'Unknown';
  const getSubjectColor = (id: string) => subjects.find(s => s.id === id)?.color || '#6B7280';

  const getGradeData = () => {
    return subjects.map(subject => {
      const subjectGrades = grades.filter(g => g.subjectId === subject.id);
      const totalWeightage = subjectGrades.reduce((sum, g) => sum + g.weightage, 0);
      const weightedSum = subjectGrades.reduce((sum, g) => {
        const percentage = (g.score / g.maxMarks) * 100;
        return sum + (percentage * g.weightage);
      }, 0);
      const avgPercentage = totalWeightage > 0 ? weightedSum / totalWeightage : 0;
      
      return {
        name: subject.name,
        percentage: Math.round(avgPercentage * 10) / 10,
        color: subject.color,
        grades: subjectGrades.length,
      };
    }).filter(d => d.grades > 0);
  };

  const getTrendData = () => {
    return [...grades]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-10)
      .map(g => ({
        date: formatDate(g.date, 'MM/dd'),
        percentage: Math.round((g.score / g.maxMarks) * 100),
        subject: getSubjectName(g.subjectId),
      }));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Grade Tracker
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track and analyze your academic performance
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5" />
          Add Grade
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Cumulative GPA</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {cumulativeGPA.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Average Grade</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {grades.length > 0 ? getLetterGrade(
                  grades.reduce((sum, g) => sum + (g.score / g.maxMarks) * 100, 0) / grades.length
                ) : '-'}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Assessments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {grades.length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
              <Target className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Subjects</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Set(grades.map(g => g.subjectId)).size}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Subject Performance
          </h3>
          {getGradeData().length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getGradeData()} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip />
                <Bar dataKey="percentage" fill="var(--accent)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No grade data available
            </p>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Grade Trend
          </h3>
          {getTrendData().length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getTrendData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="percentage" 
                  stroke="var(--accent)" 
                  strokeWidth={2}
                  dot={{ fill: 'var(--accent)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No trend data available
            </p>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            All Grades
          </h3>
          <Select
            value={selectedSemester}
            onChange={setSelectedSemester}
            options={[
              { value: 'all', label: 'All Semesters' },
              ...semesters.map(s => ({ value: s, label: s }))
            ]}
            className="w-40"
          />
        </div>

        {filteredGrades.length === 0 ? (
          <EmptyState
            icon={<BarChart3 className="w-8 h-8" />}
            title="No grades yet"
            description="Add your first grade to start tracking"
            action={
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="w-5 h-5" />
                Add Grade
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Subject</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Title</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Score</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Percentage</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Grade</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Weightage</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrades.map(grade => {
                  const percentage = (grade.score / grade.maxMarks) * 100;
                  const letterGrade = getLetterGrade(percentage);
                  
                  return (
                    <tr key={grade.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: getSubjectColor(grade.subjectId) }}
                          />
                          <span className="text-gray-900 dark:text-white">
                            {getSubjectName(grade.subjectId)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{grade.title}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {grade.score}/{grade.maxMarks}
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          'font-medium',
                          percentage >= 90 ? 'text-green-500' :
                          percentage >= 80 ? 'text-blue-500' :
                          percentage >= 70 ? 'text-yellow-500' : 'text-red-500'
                        )}>
                          {percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={letterGrade.startsWith('A') ? 'success' : letterGrade.startsWith('B') ? 'info' : letterGrade.startsWith('C') ? 'warning' : 'danger'}>
                          {letterGrade}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{grade.weightage}%</td>
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{formatDate(grade.date)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(grade)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setDeleteId(grade.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingGrade ? 'Edit Grade' : 'Add New Grade'}
      >
        <div className="space-y-4">
          <Select
            label="Subject *"
            value={formData.subjectId}
            onChange={(v) => setFormData({ ...formData, subjectId: v })}
            options={subjects.map(s => ({ value: s.id, label: s.name }))}
            placeholder="Select subject..."
          />

          <Input
            label="Assessment Title *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Midterm Exam"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Score Obtained"
              type="number"
              min={0}
              value={formData.score}
              onChange={(e) => setFormData({ ...formData, score: parseFloat(e.target.value) })}
            />
            <Input
              label="Maximum Marks"
              type="number"
              min={1}
              value={formData.maxMarks}
              onChange={(e) => setFormData({ ...formData, maxMarks: parseFloat(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Weightage (%)"
              type="number"
              min={1}
              max={100}
              value={formData.weightage}
              onChange={(e) => setFormData({ ...formData, weightage: parseFloat(e.target.value) })}
            />
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <Input
            label="Semester/Term"
            value={formData.semester}
            onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
            placeholder="e.g., Fall 2024"
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingGrade ? 'Update' : 'Add Grade'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Grade"
        message="Are you sure you want to delete this grade entry?"
      />
    </div>
  );
}
