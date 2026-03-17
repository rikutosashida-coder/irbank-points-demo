import { useState } from 'react';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomePopup({ isOpen, onClose }: WelcomePopupProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const pages = [
    // Page 1: 感謝のメッセージ
    {
      content: (
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            IRBANKへ入社していただいた皆様へ
          </h1>
          <p className="text-lg text-gray-700 leading-relaxed">
            いつもIRBANKをご利用いただき、そしてIRBANKクラウドファンディングにご参加いただき、誠にありがとうございます。
          </p>
        </div>
      ),
    },
    // Page 2: IRBANKの誕生
    {
      content: (
        <div className="space-y-6">
          <p className="text-lg text-gray-700 leading-relaxed">
            <strong>2013年10月</strong>、IRBANKは「上場企業の財務諸表やIR情報を、誰もが手軽に、確認できる環境をつくりたい」
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            そんな、たったひとつの純粋な想いから生まれました。
          </p>
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <p className="text-sm text-gray-500">[当時の何もないサイトの写真]</p>
          </div>
        </div>
      ),
    },
    // Page 3: 試行錯誤の日々
    {
      content: (
        <div className="space-y-6">
          <p className="text-lg text-gray-700 leading-relaxed">
            試行錯誤を繰り返しながら、ただひたすらコードを書き続けました。
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            当時はAIも存在しなかったので、この頃がいちばんきつかったです。
          </p>
          <p className="text-lg font-semibold text-gray-800 leading-relaxed">
            「これは絶対、多くの人に使ってもらえる」
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            そんな確信とワクワクがありました。
          </p>
        </div>
      ),
    },
    // Page 4: リリース後、使われなかった
    {
      content: (
        <div className="space-y-6">
          <p className="text-lg text-gray-700 leading-relaxed">
            ところが——リリースしても、全然使われませんでした（笑）
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            「あれ？想定と違うな…」と、今でもはっきり覚えています。
          </p>
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <p className="text-sm text-gray-500">[写真を入れる]</p>
          </div>
        </div>
      ),
    },
    // Page 5: それでもやめなかった
    {
      content: (
        <div className="space-y-6 text-center">
          <p className="text-2xl font-bold text-gray-800">
            それでも、やめようとは一切思いませんでした。
          </p>
          <p className="text-xl text-blue-600 font-semibold">
            なぜなら
          </p>
        </div>
      ),
    },
    // Page 6: ひたすらコード構築
    {
      content: (
        <div className="space-y-6">
          <p className="text-lg text-gray-700 leading-relaxed">
            そうしてひたすらコードを書き続け、構築し、
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            1人、また1人と多くのユーザーに使っていただけるようになり。
          </p>
        </div>
      ),
    },
    // Page 7: 月間100万人
    {
      content: (
        <div className="space-y-6 text-center">
          <p className="text-3xl font-bold text-blue-600">
            月間100万人
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            ものユーザーの皆様に支えられています。
          </p>
        </div>
      ),
    },
    // Page 8: 感謝
    {
      content: (
        <div className="space-y-6 text-center">
          <p className="text-xl font-semibold text-gray-800 leading-relaxed">
            皆様のおかげで私たちはここまで歩み続けることができました。
          </p>
          <p className="text-xl font-semibold text-gray-800">
            心から感謝申し上げます。
          </p>
        </div>
      ),
    },
    // Page 9: 第二の創業
    {
      content: (
        <div className="space-y-6">
          <p className="text-lg text-gray-700 leading-relaxed">
            そして今、私たちは<strong className="text-blue-600">「第二の創業」</strong>とも呼べる、過去最大級のアップデートを計画しています。
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            次の10年を見据え、IRBANKをさらに進化させるための、全く新しい挑戦です。
          </p>
        </div>
      ),
    },
    // Page 10: 新しいビジョン
    {
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">今後のIRBANKが目指す先</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            新しいIRBANKは、ただの投資ツールではありません。
          </p>
        </div>
      ),
    },
    // Page 11: 一緒に成長
    {
      content: (
        <div className="space-y-6">
          <p className="text-lg text-gray-700 leading-relaxed">
            あなたと一緒に成長し、学び、挑戦する場所。
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            投資を通じて、より多くの人が自分らしい未来を実現できる世界を目指します。
          </p>
        </div>
      ),
    },
    // Page 12: あなたは創業メンバー
    {
      content: (
        <div className="space-y-6 bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl">
          <h2 className="text-2xl font-bold text-gray-800 text-center">あなたは創業メンバーです</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            この挑戦を、私たちだけで進めるつもりはありません。
          </p>
        </div>
      ),
    },
    // Page 13: アーリー参加者への想い
    {
      content: (
        <div className="space-y-6">
          <p className="text-lg text-gray-700 leading-relaxed">
            これまでIRBANKを育ててくださり、アーリーでIRBANKに参加していただいたあなたのような方が、<strong className="text-blue-600">「創業メンバー」</strong>だと、私たちは本気で思っています。
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            IRBANKは、ただの投資ツールの提供にとどまりません。
          </p>
        </div>
      ),
    },
    // Page 14: 4つの特典
    {
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-blue-600 text-center">IRBANK参加で得られるもの</h2>
          <div className="space-y-4">
            <div className="bg-white border-2 border-blue-100 rounded-lg p-4">
              <div className="font-bold text-blue-600 mb-2">役職</div>
              <p className="text-sm text-gray-700">あなたのプロダクトへの貢献に応じて、特別な「役職」が与えられます。</p>
            </div>
            <div className="bg-white border-2 border-blue-100 rounded-lg p-4">
              <div className="font-bold text-blue-600 mb-2">評価</div>
              <p className="text-sm text-gray-700">プロダクトを育てる全ての行動がポイントとして評価されます。</p>
            </div>
            <div className="bg-white border-2 border-blue-100 rounded-lg p-4">
              <div className="font-bold text-blue-600 mb-2">賞状</div>
              <p className="text-sm text-gray-700">β版参加者限定の「創業参加功労賞」を授与します。</p>
            </div>
            <div className="bg-white border-2 border-blue-100 rounded-lg p-4">
              <div className="font-bold text-blue-600 mb-2">未来</div>
              <p className="text-sm text-gray-700">そして、その貢献の証であるポイントは、いずれIRBANKによるアロケーション構想を持っています。</p>
            </div>
          </div>
        </div>
      ),
    },
    // Page 15: クロージング + 経営陣
    {
      content: (
        <div className="space-y-6">
          <div className="space-y-4 text-center mb-8">
            <p className="text-lg font-semibold text-gray-800">
              IRBANK運営、ユーザー、の境界を越えてプロダクトを愛し、育てていく。
            </p>
            <p className="text-base text-gray-700">
              そんな、本質的なユーザーと一体型のプロダクトを、私たちは本気で目指しています。
            </p>
            <div className="bg-blue-50 rounded-lg p-6">
              <p className="text-base text-gray-700 mb-3">
                まずは、新しく生まれ変わるIRBANKのβ版を体験し、あなたの声を聞かせてください。
              </p>
              <p className="text-lg font-bold text-blue-600">
                あなたのフィードバックが、未来のIRBANKを創ります。
              </p>
            </div>
            <p className="text-base text-gray-700">
              私たちは、IRBANK側からアロケーションをはじめとした様々な機会を積極的に提供していきます。
            </p>
            <p className="text-lg font-semibold text-gray-800">
              これからIRBANKを一緒に育てていただけること、<br />
              そしてIRBANKに「入社」していただけたことに、<br />
              心から感謝しています。
            </p>
          </div>
          <div className="border-t pt-6">
            <h3 className="text-xl font-bold text-center mb-4">経営陣からのWelcomeメッセージ</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { role: 'CEO', name: '指田 悠馬' },
                { role: '最高顧問', name: '日塔 大輔' },
                { role: 'CTO', name: '前 一樹' },
                { role: 'CMO', name: '指田 陸斗' },
                { role: 'COO', name: '宮島 洋佑' },
                { role: 'リードエンジニア', name: '山口 泰輝' },
              ].map((exec, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {exec.name.charAt(0)}
                  </div>
                  <div className="text-xs text-blue-600 font-semibold">{exec.role}</div>
                  <div className="text-sm font-bold text-gray-800">{exec.name}</div>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-gray-600 mt-4">
              IRBANKへようこそ。一緒に新しい未来を創っていきましょう。
            </p>
          </div>
        </div>
      ),
    },
  ];

  if (!isOpen) return null;

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="text-sm font-semibold text-gray-600">
            {currentPage + 1} / {pages.length}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {pages[currentPage].content}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between p-4 border-t">
          <button
            onClick={handlePrev}
            disabled={currentPage === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors font-semibold text-gray-700"
          >
            <FiChevronLeft className="w-5 h-5" />
            戻る
          </button>
          <div className="flex gap-1">
            {pages.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentPage
                    ? 'w-8 bg-blue-600'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-colors font-semibold"
          >
            {currentPage === pages.length - 1 ? 'IRBANKを始める' : '次へ進む'}
            <FiChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
