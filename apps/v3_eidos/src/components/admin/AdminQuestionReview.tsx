import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Question {
  id: string;
  question: string;
  options: string[];
  answer_index: number;
  cqi_score: number;
  blind_evaluation?: boolean;
  explanation?: string;
  is_publishable: boolean;
  review_status: string;
  review_notes: string;
  reviewer?: string;
  review_date?: string;
  quality_level?: string;
  scenario?: string;
}

const REVIEW_STATUS_OPTIONS = [
  { value: 'pending_review', label: '待審核' },
  { value: 'confirmed', label: '確認發佈' },
  { value: 'corrected', label: '已修正' },
  { value: 'needs_rework', label: '需重測' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'needs_rework':
      return 'bg-red-100 text-red-800';
    case 'corrected':
      return 'bg-blue-100 text-blue-800';
    case 'pending_review':
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};

export default function AdminQuestionReview() {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewStatus, setReviewStatus] = useState('pending_review');
  const [reviewNotes, setReviewNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [currentUser] = useState('Admin User');

  useEffect(() => {
    // Fetch question data
    const fetchQuestion = async () => {
      try {
        // In a real implementation, this would call an API endpoint
        // For now, use dummy data
        setQuestion({
          id: questionId || 'Q1',
          question: '【在探討地球漫長的地質歷史時】小強發現高山上露出的地層中有海洋珊瑚的印痕化石。關於這個發現，最合理的科學推論是什麼？',
          options: [
            '化石是岩石自己長出來的紋路，剛好長得很像珊瑚',
            '這證明了古代曾經發生過淹沒全世界高山的「大洪水」',
            '地層所在的位置很久以前曾是溫暖的海域環境，後來經由板塊擠壓運動而抬升成高山',
            '古代的珊瑚進化出了可以在陸地上爬行的能力'
          ],
          answer_index: 2,
          cqi_score: 7.5,
          blind_evaluation: false,
          explanation: '板塊擠壓抬升是核心推論（選項 A）',
          is_publishable: false,
          review_status: 'pending_review',
          review_notes: '',
          quality_level: 'QL3',
          scenario: '地質證據分析'
        });
        setReviewStatus('pending_review');
      } catch (error) {
        console.error('Failed to fetch question:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId]);

  const handleSave = async () => {
    if (!question) return;

    setSaving(true);
    try {
      // In a real implementation, this would call an API endpoint
      const updatedQuestion = {
        ...question,
        review_status: reviewStatus,
        review_notes: reviewNotes,
        reviewer: currentUser,
        review_date: new Date().toISOString().split('T')[0],
        is_publishable: reviewStatus === 'confirmed'
      };

      console.log('Saving question review:', updatedQuestion);
      // TODO: Save to API

      setQuestion(updatedQuestion);
      alert('審核已保存');
    } catch (error) {
      console.error('Failed to save review:', error);
      alert('保存失敗');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">載入中...</div>;
  }

  if (!question) {
    return <div className="text-center py-8">無法載入題目</div>;
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">審核題目</h1>
          <p className="text-gray-500 mt-2">題號: {question.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            返回
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Question Info */}
          <Card>
            <CardHeader>
              <CardTitle>題目信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">題文</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded">
                  {question.question}
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">選項</h3>
                <div className="space-y-2">
                  {question.options.map((option, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded border-2 ${
                        idx === question.answer_index
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="font-medium text-gray-600">
                          {String.fromCharCode(65 + idx)})
                        </span>
                        <span>{option}</span>
                        {idx === question.answer_index && (
                          <Badge className="ml-auto">正確答案</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-600">CQI 分數</h4>
                  <p className="text-lg font-semibold">{question.cqi_score}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600">品質等級</h4>
                  <p className="text-lg font-semibold">{question.quality_level}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600">場景</h4>
                  <p className="text-sm">{question.scenario}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600">盲測結果</h4>
                  <Badge variant={question.blind_evaluation ? 'default' : 'secondary'}>
                    {question.blind_evaluation ? '已通過' : '未評估'}
                  </Badge>
                </div>
              </div>

              {question.explanation && (
                <div>
                  <h3 className="font-medium mb-2">解析</h3>
                  <p className="text-gray-700 bg-blue-50 p-4 rounded">
                    {question.explanation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Review Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">審核狀態</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={reviewStatus} onValueChange={setReviewStatus}>
                {REVIEW_STATUS_OPTIONS.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="font-normal cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="pt-2 border-t">
                <h4 className="text-sm font-medium mb-2">審核備註</h4>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="輸入審核備註..."
                  rows={4}
                  className="text-sm"
                />
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">審核者：</span>
                  <span className="font-medium">{currentUser}</span>
                </div>
                <div>
                  <span className="text-gray-600">審核時間：</span>
                  <span className="font-medium">
                    {new Date().toLocaleDateString('zh-TW')}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? '保存中...' : '保存審核'}
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      上一道題
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogTitle>上一道題</AlertDialogTitle>
                    <AlertDialogDescription>
                      前往上一道題目
                    </AlertDialogDescription>
                    <AlertDialogAction>確認</AlertDialogAction>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      下一道題
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogTitle>下一道題</AlertDialogTitle>
                    <AlertDialogDescription>
                      前往下一道題目
                    </AlertDialogDescription>
                    <AlertDialogAction>確認</AlertDialogAction>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
