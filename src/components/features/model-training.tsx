'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Sparkles, Upload, Trash2, User, Plus, CheckCircle2 } from 'lucide-react';

interface TrainedModel {
  id: string;
  name: string;
  type: string;
  imageCount: number;
  createdAt: string;
  status: 'ready' | 'training';
}

export default function ModelTraining() {
  const [modelName, setModelName] = useState('');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainedModels, setTrainedModels] = useState<TrainedModel[]>([
    {
      id: '1',
      name: '亚洲女性模特A',
      type: 'female',
      imageCount: 15,
      createdAt: '2024-01-20',
      status: 'ready'
    }
  ]);
  const [selectedType, setSelectedType] = useState('female');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const modelTypes = [
    { id: 'female', name: '女性', icon: '👩' },
    { id: 'male', name: '男性', icon: '👨' },
    { id: 'child', name: '儿童', icon: '👧' },
    { id: 'custom', name: '自定义', icon: '✨' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      setUploadedImages(prev => [...prev, ...imageFiles]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleStartTraining = async () => {
    if (!modelName) {
      alert('请输入模特名称');
      return;
    }

    if (uploadedImages.length < 3) {
      alert('请至少上传3张照片（建议15-20张，包含不同角度和表情）');
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);

    try {
      const formData = new FormData();
      formData.append('modelName', modelName);
      formData.append('modelType', selectedType);
      
      uploadedImages.forEach((image, index) => {
        formData.append(`image_${index}`, image);
      });

      const response = await fetch('/api/train-model', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        
        // 模拟训练进度
        const progressInterval = setInterval(() => {
          setTrainingProgress(prev => {
            if (prev >= 100) {
              clearInterval(progressInterval);
              setIsTraining(false);
              
              // 添加新模型到列表
              const newModel: TrainedModel = {
                id: Date.now().toString(),
                name: modelName,
                type: selectedType,
                imageCount: uploadedImages.length,
                createdAt: new Date().toISOString().split('T')[0],
                status: 'ready'
              };
              
              setTrainedModels(prev => [newModel, ...prev]);
              setModelName('');
              setUploadedImages([]);
              
              return 100;
            }
            return prev + Math.random() * 15;
          });
        }, 500);

        if (!response.ok) {
          throw new Error('训练失败');
        }
      } else {
        throw new Error('训练失败');
      }
    } catch (error) {
      console.error('训练失败:', error);
      alert('训练失败，请稍后重试');
      setIsTraining(false);
    }
  };

  const handleDeleteModel = (modelId: string) => {
    if (confirm('确定要删除这个模特模型吗？')) {
      setTrainedModels(prev => prev.filter(model => model.id !== modelId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
          <User className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">AI模特训练</h2>
          <p className="text-sm text-muted-foreground">上传照片训练专属AI虚拟模特，降低拍摄成本</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：训练区域 */}
        <Card>
          <CardHeader>
            <CardTitle>训练新模特</CardTitle>
            <CardDescription>上传真人照片，训练专属AI虚拟模特</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 模特名称 */}
            <div className="space-y-2">
              <Label>模特名称 *</Label>
              <input
                type="text"
                placeholder="例如：亚洲女性模特A"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {/* 模特类型 */}
            <div className="space-y-2">
              <Label>模特类型</Label>
              <div className="flex flex-wrap gap-2">
                {modelTypes.map((type) => (
                  <Badge
                    key={type.id}
                    variant={selectedType === type.id ? 'default' : 'outline'}
                    className={`cursor-pointer hover:opacity-80 ${
                      selectedType === type.id ? 'bg-gradient-to-r from-violet-500 to-purple-600' : ''
                    }`}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <span className="mr-1">{type.icon}</span>
                    {type.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 照片上传 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>上传照片 ({uploadedImages.length}/20)</Label>
                <span className="text-xs text-muted-foreground">
                  建议上传15-20张，包含大脸照和全身照
                </span>
              </div>
              
              <div
                className="flex min-h-[180px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadedImages.length === 0 ? (
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      点击或拖拽上传照片
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      支持 JPG、PNG 格式，最多20张
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 p-4 w-full">
                    {uploadedImages.slice(0, 8).map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`照片 ${index + 1}`}
                          className="w-full h-16 object-cover rounded"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute -top-1 -right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(index);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {uploadedImages.length > 8 && (
                      <div className="flex items-center justify-center h-16 bg-slate-100 dark:bg-slate-800 rounded text-sm text-muted-foreground">
                        +{uploadedImages.length - 8}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* 训练进度 */}
            {isTraining && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>训练进度</Label>
                  <span className="text-sm font-medium text-violet-600">
                    {Math.round(trainingProgress)}%
                  </span>
                </div>
                <Progress value={trainingProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  正在训练中，请稍候...
                </p>
              </div>
            )}

            {/* 训练按钮 */}
            <Button
              onClick={handleStartTraining}
              disabled={isTraining || uploadedImages.length < 3}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600"
            >
              {isTraining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  训练中...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  开始训练
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 右侧：已训练的模型 */}
        <Card>
          <CardHeader>
            <CardTitle>已训练的模特</CardTitle>
            <CardDescription>管理和使用您的专属AI模特</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trainedModels.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <p>还没有训练的模特</p>
                  <p className="text-sm">上传照片开始训练吧</p>
                </div>
              ) : (
                trainedModels.map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-950 dark:to-purple-950">
                      <span className="text-2xl">
                        {model.type === 'female' ? '👩' : model.type === 'male' ? '👨' : model.type === 'child' ? '👧' : '✨'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium truncate">{model.name}</h4>
                        {model.status === 'ready' && (
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {model.imageCount} 张照片 · {model.createdAt}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteModel(model.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* 使用提示 */}
            {trainedModels.length > 0 && (
              <div className="mt-4 p-3 bg-violet-50 dark:bg-violet-950 rounded-lg">
                <p className="text-xs text-violet-700 dark:text-violet-300">
                  💡 提示：训练完成后，您可以在"AI商品图生成"功能中使用这些专属模特。
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">使用说明</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>1. <strong>照片要求：</strong>建议上传15-20张高质量照片，包含不同角度、表情和姿势的照片（正面、侧面、全身、局部特写）。</p>
          <p>2. <strong>照片质量：</strong>使用清晰、光线良好的照片，避免模糊或过度修图的照片。</p>
          <p>3. <strong>训练时间：</strong>根据照片数量和质量，训练通常需要2-5分钟。</p>
          <p>4. <strong>模特类型：</strong>选择正确的模特类型有助于提高训练效果。</p>
          <p>5. <strong>使用场景：</strong>训练后的模特可用于生成各种商品展示图，降低请真人模特的拍摄成本。</p>
        </CardContent>
      </Card>
    </div>
  );
}
