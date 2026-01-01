// FORGE - Exercise Database

const MUSCLE_GROUPS = {
    // 肩
    shoulder_front: { id: 'shoulder_front', name: '肩（前部）', category: '肩' },
    shoulder_side: { id: 'shoulder_side', name: '肩（中部）', category: '肩' },
    shoulder_rear: { id: 'shoulder_rear', name: '肩（後部）', category: '肩' },

    // 胸
    chest_upper: { id: 'chest_upper', name: '胸（上部）', category: '胸' },
    chest_middle: { id: 'chest_middle', name: '胸（中部）', category: '胸' },
    chest_lower: { id: 'chest_lower', name: '胸（下部）', category: '胸' },
    chest_inner: { id: 'chest_inner', name: '胸（内側）', category: '胸' },

    // 背中
    back_lats: { id: 'back_lats', name: '広背筋', category: '背中' },
    back_traps_upper: { id: 'back_traps_upper', name: '僧帽筋（上部）', category: '背中' },
    back_traps_mid: { id: 'back_traps_mid', name: '僧帽筋（中下部）', category: '背中' },
    back_erector: { id: 'back_erector', name: '脊柱起立筋', category: '背中' },
    back_teres: { id: 'back_teres', name: '大円筋', category: '背中' },

    // 腕
    biceps: { id: 'biceps', name: '上腕二頭筋', category: '腕' },
    triceps: { id: 'triceps', name: '上腕三頭筋', category: '腕' },
    forearms: { id: 'forearms', name: '前腕', category: '腕' },

    // 脚
    quads: { id: 'quads', name: '大腿四頭筋', category: '脚' },
    hamstrings: { id: 'hamstrings', name: 'ハムストリング', category: '脚' },
    calves: { id: 'calves', name: 'カーフ', category: '脚' },
    adductors: { id: 'adductors', name: '内転筋', category: '脚' },

    // 臀部
    glutes_max: { id: 'glutes_max', name: '大臀筋', category: '臀部' },
    glutes_med: { id: 'glutes_med', name: '中臀筋', category: '臀部' },

    // 腹
    abs_rectus: { id: 'abs_rectus', name: '腹直筋', category: '腹' },
    abs_obliques: { id: 'abs_obliques', name: '腹斜筋', category: '腹' }
};

const DEFAULT_EXERCISES = [
    // ==================== 肩（前部）====================
    { id: 'e001', name: 'ショルダープレス（バーベル）', muscle: 'shoulder_front', isCustom: false },
    { id: 'e002', name: 'ショルダープレス（ダンベル）', muscle: 'shoulder_front', isCustom: false },
    { id: 'e003', name: 'マシンショルダープレス', muscle: 'shoulder_front', isCustom: false },
    { id: 'e004', name: 'アーノルドプレス', muscle: 'shoulder_front', isCustom: false },
    { id: 'e005', name: 'フロントレイズ（ダンベル）', muscle: 'shoulder_front', isCustom: false },
    { id: 'e006', name: 'フロントレイズ（ケーブル）', muscle: 'shoulder_front', isCustom: false },
    { id: 'e007', name: 'フロントレイズ（プレート）', muscle: 'shoulder_front', isCustom: false },

    // ==================== 肩（中部）====================
    { id: 'e008', name: 'サイドレイズ（ダンベル）', muscle: 'shoulder_side', isCustom: false },
    { id: 'e009', name: 'サイドレイズ（ケーブル）', muscle: 'shoulder_side', isCustom: false },
    { id: 'e010', name: 'マシンサイドレイズ', muscle: 'shoulder_side', isCustom: false },
    { id: 'e011', name: 'アップライトロウ', muscle: 'shoulder_side', isCustom: false },
    { id: 'e012', name: 'インクラインサイドレイズ', muscle: 'shoulder_side', isCustom: false },

    // ==================== 肩（後部）====================
    { id: 'e013', name: 'リアレイズ（ダンベル）', muscle: 'shoulder_rear', isCustom: false },
    { id: 'e014', name: 'リアレイズ（ケーブル）', muscle: 'shoulder_rear', isCustom: false },
    { id: 'e015', name: 'リアデルトフライ（マシン）', muscle: 'shoulder_rear', isCustom: false },
    { id: 'e016', name: 'フェイスプル', muscle: 'shoulder_rear', isCustom: false },
    { id: 'e017', name: 'ベントオーバーリアレイズ', muscle: 'shoulder_rear', isCustom: false },

    // ==================== 胸（上部）====================
    { id: 'e018', name: 'インクラインベンチプレス（バーベル）', muscle: 'chest_upper', isCustom: false },
    { id: 'e019', name: 'インクラインベンチプレス（ダンベル）', muscle: 'chest_upper', isCustom: false },
    { id: 'e020', name: 'インクラインダンベルフライ', muscle: 'chest_upper', isCustom: false },
    { id: 'e021', name: 'インクラインマシンプレス', muscle: 'chest_upper', isCustom: false },
    { id: 'e022', name: 'ロープーリーケーブルフライ', muscle: 'chest_upper', isCustom: false },

    // ==================== 胸（中部）====================
    { id: 'e023', name: 'ベンチプレス（バーベル）', muscle: 'chest_middle', isCustom: false },
    { id: 'e024', name: 'ベンチプレス（ダンベル）', muscle: 'chest_middle', isCustom: false },
    { id: 'e025', name: 'ダンベルフライ', muscle: 'chest_middle', isCustom: false },
    { id: 'e026', name: 'マシンチェストプレス', muscle: 'chest_middle', isCustom: false },
    { id: 'e027', name: 'プッシュアップ', muscle: 'chest_middle', isCustom: false },
    { id: 'e028', name: 'スミスマシンベンチプレス', muscle: 'chest_middle', isCustom: false },

    // ==================== 胸（下部）====================
    { id: 'e029', name: 'デクラインベンチプレス（バーベル）', muscle: 'chest_lower', isCustom: false },
    { id: 'e030', name: 'デクラインベンチプレス（ダンベル）', muscle: 'chest_lower', isCustom: false },
    { id: 'e031', name: 'ディップス', muscle: 'chest_lower', isCustom: false },
    { id: 'e032', name: 'ハイプーリーケーブルフライ', muscle: 'chest_lower', isCustom: false },
    { id: 'e033', name: 'デクラインプッシュアップ', muscle: 'chest_lower', isCustom: false },

    // ==================== 胸（内側）====================
    { id: 'e034', name: 'ケーブルクロスオーバー', muscle: 'chest_inner', isCustom: false },
    { id: 'e035', name: 'ペックフライ（マシン）', muscle: 'chest_inner', isCustom: false },
    { id: 'e036', name: 'プレートスクイーズプレス', muscle: 'chest_inner', isCustom: false },
    { id: 'e037', name: 'ダイヤモンドプッシュアップ', muscle: 'chest_inner', isCustom: false },

    // ==================== 広背筋 ====================
    { id: 'e038', name: 'ラットプルダウン（ワイド）', muscle: 'back_lats', isCustom: false },
    { id: 'e039', name: 'ラットプルダウン（ナロー）', muscle: 'back_lats', isCustom: false },
    { id: 'e040', name: 'チンニング（懸垂）', muscle: 'back_lats', isCustom: false },
    { id: 'e041', name: 'ワンハンドロウ', muscle: 'back_lats', isCustom: false },
    { id: 'e042', name: 'シーテッドケーブルロウ', muscle: 'back_lats', isCustom: false },
    { id: 'e043', name: 'Tバーロウ', muscle: 'back_lats', isCustom: false },

    // ==================== 僧帽筋（上部）====================
    { id: 'e044', name: 'バーベルシュラッグ', muscle: 'back_traps_upper', isCustom: false },
    { id: 'e045', name: 'ダンベルシュラッグ', muscle: 'back_traps_upper', isCustom: false },
    { id: 'e046', name: 'スミスマシンシュラッグ', muscle: 'back_traps_upper', isCustom: false },
    { id: 'e047', name: 'ケーブルシュラッグ', muscle: 'back_traps_upper', isCustom: false },

    // ==================== 僧帽筋（中下部）====================
    { id: 'e048', name: 'ベントオーバーロウ（バーベル）', muscle: 'back_traps_mid', isCustom: false },
    { id: 'e049', name: 'ベントオーバーロウ（ダンベル）', muscle: 'back_traps_mid', isCustom: false },
    { id: 'e050', name: 'シーテッドロウ（マシン）', muscle: 'back_traps_mid', isCustom: false },
    { id: 'e051', name: 'インバーテッドロウ', muscle: 'back_traps_mid', isCustom: false },
    { id: 'e052', name: 'ペンドレイロウ', muscle: 'back_traps_mid', isCustom: false },

    // ==================== 脊柱起立筋 ====================
    { id: 'e053', name: 'デッドリフト', muscle: 'back_erector', isCustom: false },
    { id: 'e054', name: 'ルーマニアンデッドリフト', muscle: 'back_erector', isCustom: false },
    { id: 'e055', name: 'バックエクステンション', muscle: 'back_erector', isCustom: false },
    { id: 'e056', name: 'グッドモーニング', muscle: 'back_erector', isCustom: false },
    { id: 'e057', name: 'ハイパーエクステンション', muscle: 'back_erector', isCustom: false },

    // ==================== 大円筋 ====================
    { id: 'e058', name: 'ストレートアームプルダウン', muscle: 'back_teres', isCustom: false },
    { id: 'e059', name: 'プルオーバー（ダンベル）', muscle: 'back_teres', isCustom: false },
    { id: 'e060', name: 'プルオーバー（マシン）', muscle: 'back_teres', isCustom: false },

    // ==================== 上腕二頭筋 ====================
    { id: 'e061', name: 'バーベルカール', muscle: 'biceps', isCustom: false },
    { id: 'e062', name: 'ダンベルカール', muscle: 'biceps', isCustom: false },
    { id: 'e063', name: 'ハンマーカール', muscle: 'biceps', isCustom: false },
    { id: 'e064', name: 'インクラインダンベルカール', muscle: 'biceps', isCustom: false },
    { id: 'e065', name: 'プリーチャーカール', muscle: 'biceps', isCustom: false },
    { id: 'e066', name: 'ケーブルカール', muscle: 'biceps', isCustom: false },
    { id: 'e067', name: 'コンセントレーションカール', muscle: 'biceps', isCustom: false },

    // ==================== 上腕三頭筋 ====================
    { id: 'e068', name: 'トライセプスプッシュダウン', muscle: 'triceps', isCustom: false },
    { id: 'e069', name: 'スカルクラッシャー', muscle: 'triceps', isCustom: false },
    { id: 'e070', name: 'オーバーヘッドトライセプスエクステンション', muscle: 'triceps', isCustom: false },
    { id: 'e071', name: 'トライセプスキックバック', muscle: 'triceps', isCustom: false },
    { id: 'e072', name: 'ナローグリップベンチプレス', muscle: 'triceps', isCustom: false },
    { id: 'e073', name: 'ダイヤモンドプッシュアップ', muscle: 'triceps', isCustom: false },
    { id: 'e074', name: 'ケーブルオーバーヘッドエクステンション', muscle: 'triceps', isCustom: false },

    // ==================== 前腕 ====================
    { id: 'e075', name: 'リストカール', muscle: 'forearms', isCustom: false },
    { id: 'e076', name: 'リバースリストカール', muscle: 'forearms', isCustom: false },
    { id: 'e077', name: 'リバースカール', muscle: 'forearms', isCustom: false },
    { id: 'e078', name: 'ファーマーズウォーク', muscle: 'forearms', isCustom: false },

    // ==================== 大腿四頭筋 ====================
    { id: 'e079', name: 'スクワット（バーベル）', muscle: 'quads', isCustom: false },
    { id: 'e080', name: 'フロントスクワット', muscle: 'quads', isCustom: false },
    { id: 'e081', name: 'レッグプレス', muscle: 'quads', isCustom: false },
    { id: 'e082', name: 'レッグエクステンション', muscle: 'quads', isCustom: false },
    { id: 'e083', name: 'ハックスクワット', muscle: 'quads', isCustom: false },
    { id: 'e084', name: 'ゴブレットスクワット', muscle: 'quads', isCustom: false },
    { id: 'e085', name: 'シシースクワット', muscle: 'quads', isCustom: false },

    // ==================== ハムストリング ====================
    { id: 'e086', name: 'レッグカール（ライイング）', muscle: 'hamstrings', isCustom: false },
    { id: 'e087', name: 'レッグカール（シーテッド）', muscle: 'hamstrings', isCustom: false },
    { id: 'e088', name: 'スティフレッグデッドリフト', muscle: 'hamstrings', isCustom: false },
    { id: 'e089', name: 'ノルディックハムストリングカール', muscle: 'hamstrings', isCustom: false },
    { id: 'e090', name: 'グルートハムレイズ', muscle: 'hamstrings', isCustom: false },

    // ==================== カーフ ====================
    { id: 'e091', name: 'スタンディングカーフレイズ', muscle: 'calves', isCustom: false },
    { id: 'e092', name: 'シーテッドカーフレイズ', muscle: 'calves', isCustom: false },
    { id: 'e093', name: 'レッグプレスカーフレイズ', muscle: 'calves', isCustom: false },
    { id: 'e094', name: 'ドンキーカーフレイズ', muscle: 'calves', isCustom: false },

    // ==================== 内転筋 ====================
    { id: 'e095', name: 'アダクターマシン', muscle: 'adductors', isCustom: false },
    { id: 'e096', name: 'ワイドスタンススクワット', muscle: 'adductors', isCustom: false },
    { id: 'e097', name: 'サイドランジ', muscle: 'adductors', isCustom: false },
    { id: 'e098', name: 'ケーブルアダクション', muscle: 'adductors', isCustom: false },

    // ==================== 大臀筋 ====================
    { id: 'e099', name: 'ヒップスラスト', muscle: 'glutes_max', isCustom: false },
    { id: 'e100', name: 'ブルガリアンスクワット', muscle: 'glutes_max', isCustom: false },
    { id: 'e101', name: 'グルートブリッジ', muscle: 'glutes_max', isCustom: false },
    { id: 'e102', name: 'ケーブルキックバック', muscle: 'glutes_max', isCustom: false },
    { id: 'e103', name: 'ステップアップ', muscle: 'glutes_max', isCustom: false },

    // ==================== 中臀筋 ====================
    { id: 'e104', name: 'アブダクターマシン', muscle: 'glutes_med', isCustom: false },
    { id: 'e105', name: 'サイドライイングヒップアブダクション', muscle: 'glutes_med', isCustom: false },
    { id: 'e106', name: 'クラムシェル', muscle: 'glutes_med', isCustom: false },
    { id: 'e107', name: 'バンドウォーク', muscle: 'glutes_med', isCustom: false },

    // ==================== 腹直筋 ====================
    { id: 'e108', name: 'クランチ', muscle: 'abs_rectus', isCustom: false },
    { id: 'e109', name: 'シットアップ', muscle: 'abs_rectus', isCustom: false },
    { id: 'e110', name: 'レッグレイズ', muscle: 'abs_rectus', isCustom: false },
    { id: 'e111', name: 'ハンギングレッグレイズ', muscle: 'abs_rectus', isCustom: false },
    { id: 'e112', name: 'アブローラー', muscle: 'abs_rectus', isCustom: false },
    { id: 'e113', name: 'ケーブルクランチ', muscle: 'abs_rectus', isCustom: false },
    { id: 'e114', name: 'プランク', muscle: 'abs_rectus', isCustom: false },

    // ==================== 腹斜筋 ====================
    { id: 'e115', name: 'サイドクランチ', muscle: 'abs_obliques', isCustom: false },
    { id: 'e116', name: 'ロシアンツイスト', muscle: 'abs_obliques', isCustom: false },
    { id: 'e117', name: 'サイドプランク', muscle: 'abs_obliques', isCustom: false },
    { id: 'e118', name: 'ウッドチョップ', muscle: 'abs_obliques', isCustom: false },
    { id: 'e119', name: 'バイシクルクランチ', muscle: 'abs_obliques', isCustom: false },
    { id: 'e120', name: 'ハンギングサイドレイズ', muscle: 'abs_obliques', isCustom: false }
];

// カテゴリ別にグループ化
const MUSCLE_CATEGORIES = ['肩', '胸', '背中', '腕', '脚', '臀部', '腹'];

// METs値（消費カロリー計算用）
const EXERCISE_METS = {
    light: 3.0,    // 軽い筋トレ（アイソレーション系）
    moderate: 5.0, // 中程度（マシン系）
    heavy: 6.0     // 高強度（コンパウンド系）
};

// 高強度種目リスト
const HEAVY_EXERCISES = [
    'e023', 'e024', 'e053', 'e054', 'e079', 'e080', 'e081', 'e083', // ベンチプレス、デッドリフト、スクワット系
    'e048', 'e099', 'e100' // ベントオーバーロウ、ヒップスラスト、ブルガリアンスクワット
];

// 種目のMETs値を取得
function getExerciseMets(exerciseId) {
    if (HEAVY_EXERCISES.includes(exerciseId)) {
        return EXERCISE_METS.heavy;
    }
    return EXERCISE_METS.moderate;
}
