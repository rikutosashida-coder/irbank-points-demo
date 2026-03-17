import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomePopup({ isOpen, onClose }: WelcomePopupProps) {
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setAnimationStep(0);
      const timers = [
        setTimeout(() => setAnimationStep(1), 300),
        setTimeout(() => setAnimationStep(2), 900),
        setTimeout(() => setAnimationStep(3), 1500),
        setTimeout(() => setAnimationStep(4), 2100),
        setTimeout(() => setAnimationStep(5), 2700),
        setTimeout(() => setAnimationStep(6), 3300),
      ];
      return () => timers.forEach(t => clearTimeout(t));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
        animation: 'fadeIn 0.3s ease-out',
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeInText {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slideUp 0.6s ease-out forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.5s ease-out forwards;
        }
        .animate-slide-left {
          animation: slideInLeft 0.5s ease-out forwards;
        }
        .animate-slide-right {
          animation: slideInRight 0.5s ease-out forwards;
        }
        .animate-fade-in {
          animation: fadeInText 0.8s ease-out forwards;
        }
      `}</style>

      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          animation: 'scaleIn 0.4s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(0, 0, 0, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            zIndex: 10,
            animation: 'fadeIn 0.5s ease-out 0.5s backwards',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <FiX size={20} color="#333" />
        </button>

        {/* Content */}
        <div style={{ padding: '60px 40px' }}>
          {/* Welcome Header */}
          {animationStep >= 0 && (
            <div style={{ textAlign: 'center', marginBottom: '40px' }} className="animate-slide-up">
              <h1
                style={{
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '20px',
                  lineHeight: 1.4,
                }}
              >
                IRBANKへ入社していただいた皆様へ
              </h1>
              <p style={{ fontSize: '1rem', color: '#666', lineHeight: 1.8 }} className="animate-fade-in">
                いつもIRBANKをご利用いただき、そして
                <br />
                IRBANKクラウドファンディングにご参加いただき、
                <br />
                誠にありがとうございます。
              </p>
            </div>
          )}

          {/* Section: IRBANK History & Journey */}
          {animationStep >= 1 && (
            <section style={{ marginBottom: '48px' }} className="animate-slide-left">
              <div style={{ color: '#555', lineHeight: 1.9, fontSize: '0.95rem' }}>
                <p style={{ marginBottom: '16px', animation: 'fadeInText 0.8s ease-out 0.2s backwards' }}>
                  <strong>201〇年〇月</strong>、IRBANKは、より多くの人が投資を通じて未来を切り拓ける世界を作るという想いから誕生しました。
                </p>
                <p style={{ marginBottom: '16px', animation: 'fadeInText 0.8s ease-out 0.4s backwards' }}>
                  この10年間、決して平坦な道ではありませんでした。
                </p>
                <p style={{ marginBottom: '16px', animation: 'fadeInText 0.8s ease-out 0.6s backwards' }}>
                  しかし、<strong>70万人</strong>ものユーザーの皆様に支えられ、私たちはここまで歩み続けることができました。
                  <br />
                  心から感謝申し上げます。
                </p>
                <p style={{ animation: 'fadeInText 0.8s ease-out 0.8s backwards', marginTop: '24px', fontSize: '1.05rem', fontWeight: '600', color: '#333' }}>
                  そして今、私たちは「<strong style={{ color: '#667eea' }}>第二の創業</strong>」とも呼べる、過去最大級のアップデートを計画しています。
                  <br />
                  次の10年を見据え、IRBANKをさらに進化させるための、全く新しい挑戦です。
                </p>
              </div>
            </section>
          )}

          {/* Section: Future Vision */}
          {animationStep >= 2 && (
            <section style={{ marginBottom: '48px' }} className="animate-slide-right">
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: '16px',
                  borderLeft: '4px solid #764ba2',
                  paddingLeft: '16px',
                }}
              >
                今後のIRBANKが目指す先
              </h2>
              <div style={{ color: '#555', lineHeight: 1.9, fontSize: '0.95rem' }}>
                <p style={{ marginBottom: '14px', animation: 'fadeInText 0.8s ease-out 0.2s backwards' }}>
                  新しいIRBANKは、ただの投資ツールではありません。
                </p>
                <p style={{ marginBottom: '14px', animation: 'fadeInText 0.8s ease-out 0.4s backwards' }}>
                  あなたと一緒に成長し、学び、挑戦する場所。
                </p>
                <p style={{ animation: 'fadeInText 0.8s ease-out 0.6s backwards' }}>
                  投資を通じて、より多くの人が自分らしい未来を実現できる世界を目指します。
                </p>
              </div>
            </section>
          )}

          {/* Section: You are a Founding Member */}
          {animationStep >= 3 && (
            <section
              style={{
                marginBottom: '48px',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                padding: '32px',
                borderRadius: '12px',
              }}
              className="animate-scale-in"
            >
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: '20px',
                  textAlign: 'center',
                }}
              >
                あなたは創業メンバーです
              </h2>
              <div style={{ color: '#444', lineHeight: 1.9, fontSize: '0.95rem' }}>
                <p style={{ marginBottom: '14px', animation: 'fadeInText 0.8s ease-out 0.2s backwards' }}>
                  この挑戦を、私たちだけで進めるつもりはありません。
                </p>
                <p style={{ marginBottom: '14px', animation: 'fadeInText 0.8s ease-out 0.4s backwards' }}>
                  これまでIRBANKを育ててくださり、アーリーでIRBANKに参加していただいたあなたのような方が、<strong>「創業メンバー」</strong>だと、私たちは本気で思っています。
                </p>
                <p style={{ animation: 'fadeInText 0.8s ease-out 0.6s backwards' }}>
                  IRBANKは、ただの投資ツールの提供にとどまりません。
                </p>
              </div>
            </section>
          )}

          {/* Section: What You Get */}
          {animationStep >= 4 && (
            <section style={{ marginBottom: '48px' }} className="animate-slide-left">
              <h2
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 'bold',
                  color: '#667eea',
                  marginBottom: '24px',
                  textAlign: 'center',
                }}
              >
                【IRBANK参加で得られるもの】
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { title: '役職', desc: 'あなたのプロダクトへの貢献に応じて、特別な「役職」が与えられます。', delay: 0 },
                  { title: '評価', desc: 'プロダクトを育てる全ての行動がポイントとして評価されます。', delay: 0.15 },
                  { title: '賞状', desc: 'β版参加者限定の「創業参加功労賞」を授与します。', delay: 0.3 },
                  { title: '未来', desc: 'そして、その貢献の証であるポイントは、いずれIRBANKによるアロケーション構想を持っています。', delay: 0.45 },
                ].map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '20px',
                      background: 'white',
                      border: '2px solid #e0e7ff',
                      borderRadius: '10px',
                      animation: `slideInRight 0.5s ease-out ${item.delay}s backwards`,
                    }}
                  >
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#667eea', marginBottom: '8px' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#555', lineHeight: 1.7 }}>
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section: Vision & Call to Action */}
          {animationStep >= 5 && (
            <section style={{ marginBottom: '48px' }} className="animate-slide-right">
              <div style={{ color: '#555', lineHeight: 1.9, fontSize: '0.95rem', textAlign: 'center' }}>
                <p style={{ marginBottom: '16px', animation: 'fadeInText 0.8s ease-out 0.2s backwards', fontSize: '1rem', fontWeight: '600', color: '#333' }}>
                  IRBANK運営、ユーザー、の境界を越えてプロダクトを愛し、育てていく。
                </p>
                <p style={{ marginBottom: '24px', animation: 'fadeInText 0.8s ease-out 0.4s backwards' }}>
                  そんな、本質的なユーザー　一体型のプロダクトを、私たちは本気で目指しています。
                </p>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea10 0%, #764ba220 100%)',
                  padding: '24px',
                  borderRadius: '12px',
                  marginBottom: '24px',
                  animation: 'fadeInText 0.8s ease-out 0.6s backwards'
                }}>
                  <p style={{ marginBottom: '12px', color: '#333', fontWeight: '600' }}>
                    まずは、新しく生まれ変わるIRBANKのβ版を体験し、あなたの声を聞かせてください。
                  </p>
                  <p style={{ color: '#667eea', fontWeight: 'bold', fontSize: '1.05rem' }}>
                    あなたのフィードバックが、未来のIRBANKを創ります。
                  </p>
                </div>
                <p style={{ marginBottom: '12px', animation: 'fadeInText 0.8s ease-out 0.8s backwards' }}>
                  私たちは、IRBANK側からアロケーションをはじめとした様々な機会を積極的に提供していきます。
                </p>
                <p style={{ animation: 'fadeInText 0.8s ease-out 1s backwards', fontWeight: '600', color: '#333' }}>
                  これからIRBANKを一緒に育てていただけること、
                  <br />
                  そしてIRBANKに「<strong style={{ color: '#667eea' }}>入社</strong>」していただけたことに、
                  <br />
                  心から感謝しています。
                </p>
              </div>
            </section>
          )}

          {/* Section: Team Messages */}
          {animationStep >= 6 && (
            <section style={{ marginBottom: '48px' }} className="animate-slide-up">
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: '24px',
                  textAlign: 'center',
                }}
              >
                経営陣から入社していただいた皆様へのWelcomeメッセージ
              </h2>

              {/* Executive Messages */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {[
                  { role: 'CEO（最高経営責任者）', name: '指田 悠馬', delay: 0 },
                  { role: '最高顧問', name: '日塔 大輔', delay: 0.15 },
                  { role: 'CTO（最高技術責任者）', name: '前 一樹', delay: 0.3 },
                  { role: 'CMO（最高マーケティング責任者）', name: '指田 陸斗', delay: 0.45 },
                  { role: 'COO（最高執行責任者）', name: '宮島 洋佑', delay: 0.6 },
                  { role: 'リードエンジニア', name: '山口 泰輝', delay: 0.75 },
                ].map((exec, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      gap: '20px',
                      padding: '20px',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      alignItems: 'center',
                      animation: `slideInLeft 0.5s ease-out ${exec.delay}s backwards`,
                    }}
                  >
                    <div
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        flexShrink: 0,
                        animation: `scaleIn 0.4s ease-out ${exec.delay + 0.2}s backwards`,
                      }}
                    >
                      {exec.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', color: '#667eea', fontWeight: 'bold' }}>
                        {exec.role}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
                        {exec.name}
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6, margin: 0 }}>
                        IRBANKへようこそ。一緒に新しい未来を創っていきましょう。
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Footer CTA */}
          {animationStep >= 6 && (
            <div style={{ textAlign: 'center', paddingTop: '24px', borderTop: '1px solid #eee' }} className="animate-scale-in">
              <button
                onClick={onClose}
                style={{
                  padding: '16px 48px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                }}
              >
                IRBANKを始める
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
