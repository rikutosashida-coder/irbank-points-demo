import { useState } from 'react';
import { FiX } from 'react-icons/fi';

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomePopup({ isOpen, onClose }: WelcomePopupProps) {
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
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
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
            transition: 'background 0.2s',
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
          }}
        >
          <FiX size={20} color="#333" />
        </button>

        {/* Content */}
        <div style={{ padding: '60px 40px' }}>
          {/* Welcome Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '16px',
              }}
            >
              IRBANK β版 Waiting Listへようこそ
            </h1>
            <p style={{ fontSize: '1rem', color: '#666', lineHeight: 1.6 }}>
              また、IRBANKクラウドファンディングにご参加いただき、
              <br />
              誠にありがとうございます。
            </p>
          </div>

          {/* Section: IRBANK History */}
          <section style={{ marginBottom: '48px' }}>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '16px',
                borderLeft: '4px solid #667eea',
                paddingLeft: '16px',
              }}
            >
              IRBANKの歴史
            </h2>
            <div style={{ color: '#555', lineHeight: 1.8, fontSize: '0.95rem' }}>
              <p style={{ marginBottom: '12px' }}>
                IRBANKは、より多くの人が投資を通じて未来を切り拓ける世界を作るという想いから誕生しました。
              </p>
              <p style={{ marginBottom: '12px' }}>
                これまで多くのユーザーの皆様と共に歩み、成長してきました。
              </p>
              <p>
                そして今、次のステージへ向けて、IRBANKを1から作り直しています。
              </p>
            </div>
          </section>

          {/* Section: Future Vision */}
          <section style={{ marginBottom: '48px' }}>
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
            <div style={{ color: '#555', lineHeight: 1.8, fontSize: '0.95rem' }}>
              <p style={{ marginBottom: '12px' }}>
                新しいIRBANKは、ただの投資ツールではありません。
              </p>
              <p style={{ marginBottom: '12px' }}>
                あなたと一緒に成長し、学び、挑戦する場所。
                <br />
                社員として会社を育てていくような体験を届けます。
              </p>
              <p>
                投資を通じて、より多くの人が自分らしい未来を実現できる世界を目指します。
              </p>
            </div>
          </section>

          {/* Section: Early Participants */}
          <section
            style={{
              marginBottom: '48px',
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              padding: '32px',
              borderRadius: '12px',
            }}
          >
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              あなたは創業メンバーです
            </h2>
            <div style={{ color: '#444', lineHeight: 1.8, fontSize: '0.95rem' }}>
              <p style={{ marginBottom: '12px' }}>
                アーリー参加者の皆様は、私たちにとって<strong>創業メンバー</strong>と同じ存在です。
              </p>
              <p style={{ marginBottom: '12px' }}>
                IRBANKは、ただのツール提供にとどまりません。
                <br />
                私たちは、IRBANK側からアロケーションをはじめとした様々な機会を積極的に提供していきます。
              </p>
              <p>
                これからIRBANKを一緒に育てていただけること、
                <br />
                そしてIRBANKに「<strong>入社</strong>」していただけたことに、心から感謝しています。
              </p>
            </div>
          </section>

          {/* Section: Team Messages */}
          <section style={{ marginBottom: '48px' }}>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '24px',
                textAlign: 'center',
              }}
            >
              経営陣からのメッセージ
            </h2>

            {/* Executive Messages */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {[
                { role: 'CEO（最高経営責任者）', name: '指田 陸斗' },
                { role: 'CMO（最高マーケティング責任者）', name: '指田 陸斗' },
                { role: '創業者', name: '指田 陸斗' },
                { role: 'CTO（最高技術責任者）', name: '指田 陸斗' },
                { role: 'COO（最高執行責任者）', name: '指田 陸斗' },
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

          {/* Footer CTA */}
          <div style={{ textAlign: 'center', paddingTop: '24px', borderTop: '1px solid #eee' }}>
            <button
              onClick={onClose}
              style={{
                padding: '14px 40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
              }}
            >
              IRBANKを始める
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
