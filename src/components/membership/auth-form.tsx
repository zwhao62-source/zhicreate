'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Loader2, Message } from 'lucide-react';
import Link from 'next/link';

interface AuthFormProps {
  onSuccess?: (user: any) => void;
  defaultTab?: 'login' | 'register';
  compact?: boolean;
}

export function AuthForm({ onSuccess, defaultTab = 'login', compact = false }: AuthFormProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // 登录表单
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  
  // 注册表单
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  
  // 验证码登录
  const [phoneLogin, setPhoneLogin] = useState({
    phone: '',
    code: '',
  });
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // 模拟登录
    setTimeout(() => {
      setIsLoading(false);
      onSuccess?.({
        email: loginData.email,
        plan: 'personal',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }, 1500);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      alert('两次密码输入不一致');
      return;
    }
    
    if (!registerData.agreeTerms) {
      alert('请同意服务条款');
      return;
    }
    
    setIsLoading(true);
    
    // 模拟注册
    setTimeout(() => {
      setIsLoading(false);
      onSuccess?.({
        email: registerData.email,
        plan: 'trial',
        expiresAt: null,
      });
    }, 1500);
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      onSuccess?.({
        phone: phoneLogin.phone,
        plan: 'trial',
        expiresAt: null,
      });
    }, 1500);
  };

  const handleSendCode = () => {
    if (!phoneLogin.phone.match(/^1[3-9]\d{9}$/)) {
      alert('请输入正确的手机号');
      return;
    }
    
    setCodeSent(true);
    setCountdown(60);
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCodeSent(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  if (compact) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl">登录智创云</CardTitle>
          <CardDescription>开始您的AI电商设计之旅</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">账号登录</TabsTrigger>
              <TabsTrigger value="phone">手机验证</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-3 pt-3">
              <form onSubmit={handleLogin} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs">邮箱/手机号</Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="请输入邮箱或手机号"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password" className="text-xs">密码</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="请输入密码"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                    忘记密码？
                  </Link>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  登录
                </Button>
              </form>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">或</span>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => setActiveTab('register')}>
                注册新账号
              </Button>
            </TabsContent>
            
            <TabsContent value="phone" className="space-y-3 pt-3">
              <form onSubmit={handlePhoneLogin} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-xs">手机号</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="请输入手机号"
                    value={phoneLogin.phone}
                    onChange={(e) => setPhoneLogin({ ...phoneLogin, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="code" className="text-xs">验证码</Label>
                  <div className="flex gap-2">
                    <Input
                      id="code"
                      type="text"
                      placeholder="请输入验证码"
                      value={phoneLogin.code}
                      onChange={(e) => setPhoneLogin({ ...phoneLogin, code: e.target.value })}
                      required
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      disabled={codeSent}
                      onClick={handleSendCode}
                      className="whitespace-nowrap"
                    >
                      {codeSent ? `${countdown}秒` : '获取验证码'}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  登录/注册
                </Button>
              </form>
              <p className="text-[10px] text-center text-muted-foreground">
                未注册的手机号将自动创建账号
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-xs text-muted-foreground">
            登录即表示同意 <Link href="/terms" className="text-primary hover:underline">服务条款</Link>
          </p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">智</span>
          </div>
          <CardTitle className="text-2xl">智创云电商设计</CardTitle>
          <CardDescription>AI驱动的电商内容创作平台</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">账号登录</TabsTrigger>
              <TabsTrigger value="register">注册账号</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4 pt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">邮箱/手机号</Label>
                  <Input
                    id="login-email"
                    type="text"
                    placeholder="请输入邮箱或手机号"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">密码</Label>
                    <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                      忘记密码？
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="请输入密码"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-600" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  登录
                </Button>
              </form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">其他登录方式</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" type="button">
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </Button>
                <Button variant="outline" type="button">
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="#EA4335">
                    <path d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"/>
                    <path d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z" fill="#EA4335"/>
                  </svg>
                  微信
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4 pt-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email">邮箱</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="请输入邮箱"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">设置密码</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="请设置密码（至少6位）"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">确认密码</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="请再次输入密码"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="agree-terms"
                    checked={registerData.agreeTerms}
                    onChange={(e) => setRegisterData({ ...registerData, agreeTerms: e.target.checked })}
                    className="mt-1"
                  />
                  <Label htmlFor="agree-terms" className="text-xs font-normal leading-relaxed">
                    我已阅读并同意 <Link href="/terms" className="text-primary hover:underline">《服务条款》</Link> 和 <Link href="/privacy" className="text-primary hover:underline">《隐私政策》</Link>
                  </Label>
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-600" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  注册
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-xs text-muted-foreground">
            遇到问题？<Link href="/help" className="text-primary hover:underline">联系客服</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
