// FORGE - Storage Manager

const STORAGE_KEYS = {
    USER_PROFILE: 'forge_user_profile',
    EXERCISES: 'forge_exercises',
    EXERCISE_SETTINGS: 'forge_exercise_settings',
    WORKOUT_HISTORY: 'forge_workout_history',
    ROUTINES: 'forge_routines',
    CUSTOM_EXERCISES: 'forge_custom_exercises',
    TODAY_SESSION: 'forge_today_session'
};

// 停滞判定の週数
const STAGNATION_WEEKS = {
    beginner: 4,
    intermediate: 6,
    advanced: 8
};

class Storage {
    // ユーザープロフィール
    static getUserProfile() {
        const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
        return data ? JSON.parse(data) : null;
    }

    static saveUserProfile(profile) {
        localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    }

    // 種目設定（休憩時間、メモ等）
    static getExerciseSettings(exerciseId) {
        const data = localStorage.getItem(STORAGE_KEYS.EXERCISE_SETTINGS);
        const settings = data ? JSON.parse(data) : {};
        return settings[exerciseId] || {
            restTime: 90, // デフォルト1分半
            memo: ''
        };
    }

    static saveExerciseSettings(exerciseId, settings) {
        const data = localStorage.getItem(STORAGE_KEYS.EXERCISE_SETTINGS);
        const allSettings = data ? JSON.parse(data) : {};
        allSettings[exerciseId] = { ...allSettings[exerciseId], ...settings };
        localStorage.setItem(STORAGE_KEYS.EXERCISE_SETTINGS, JSON.stringify(allSettings));
    }

    static getAllExerciseSettings() {
        const data = localStorage.getItem(STORAGE_KEYS.EXERCISE_SETTINGS);
        return data ? JSON.parse(data) : {};
    }

    // ワークアウト履歴
    static getWorkoutHistory() {
        const data = localStorage.getItem(STORAGE_KEYS.WORKOUT_HISTORY);
        return data ? JSON.parse(data) : [];
    }

    static addWorkoutRecord(record) {
        const history = this.getWorkoutHistory();
        history.push({
            ...record,
            id: Date.now().toString(),
            date: new Date().toISOString()
        });
        localStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(history));
    }

    static deleteWorkoutRecord(recordId) {
        const history = this.getWorkoutHistory();
        const filtered = history.filter(r => r.id !== recordId);
        localStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(filtered));
    }

    // 特定種目の履歴を取得
    static getExerciseHistory(exerciseId, limit = 10) {
        const history = this.getWorkoutHistory();
        return history
            .filter(r => r.exerciseId === exerciseId)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }

    // 前回の記録を取得
    static getLastRecord(exerciseId) {
        const history = this.getExerciseHistory(exerciseId, 1);
        return history.length > 0 ? history[0] : null;
    }

    // ルーティン
    static getRoutines() {
        const data = localStorage.getItem(STORAGE_KEYS.ROUTINES);
        return data ? JSON.parse(data) : [];
    }

    static saveRoutine(routine) {
        const routines = this.getRoutines();
        const existingIndex = routines.findIndex(r => r.id === routine.id);

        if (existingIndex >= 0) {
            routines[existingIndex] = routine;
        } else {
            routine.id = Date.now().toString();
            routines.push(routine);
        }

        localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
        return routine;
    }

    static deleteRoutine(routineId) {
        const routines = this.getRoutines();
        const filtered = routines.filter(r => r.id !== routineId);
        localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(filtered));
    }

    // カスタム種目
    static getCustomExercises() {
        const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_EXERCISES);
        return data ? JSON.parse(data) : [];
    }

    static addCustomExercise(exercise) {
        const customs = this.getCustomExercises();
        exercise.id = 'custom_' + Date.now().toString();
        exercise.isCustom = true;
        customs.push(exercise);
        localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(customs));
        return exercise;
    }

    static deleteCustomExercise(exerciseId) {
        const customs = this.getCustomExercises();
        const filtered = customs.filter(e => e.id !== exerciseId);
        localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(filtered));
    }

    // 全種目取得（デフォルト + カスタム）
    static getAllExercises() {
        const customs = this.getCustomExercises();
        return [...DEFAULT_EXERCISES, ...customs];
    }

    // 今日のセッション
    static getTodaySession() {
        const data = localStorage.getItem(STORAGE_KEYS.TODAY_SESSION);
        if (!data) return null;

        const session = JSON.parse(data);
        const today = new Date().toDateString();

        // 日付が変わっていたらリセット
        if (session.date !== today) {
            this.clearTodaySession();
            return null;
        }

        return session;
    }

    static saveTodaySession(session) {
        session.date = new Date().toDateString();
        localStorage.setItem(STORAGE_KEYS.TODAY_SESSION, JSON.stringify(session));
    }

    static clearTodaySession() {
        localStorage.removeItem(STORAGE_KEYS.TODAY_SESSION);
    }

    // 今日の統計計算
    static getTodayStats() {
        const history = this.getWorkoutHistory();
        const today = new Date().toDateString();
        const todayRecords = history.filter(r =>
            new Date(r.date).toDateString() === today
        );

        let totalVolume = 0;
        let totalDuration = 0;
        const profile = this.getUserProfile();
        const weight = profile ? profile.weight : 70;

        todayRecords.forEach(record => {
            if (record.sets) {
                record.sets.forEach(set => {
                    totalVolume += set.weight * set.reps;
                });
                // セット数 × 30秒で推定時間
                totalDuration += record.sets.length * 0.5; // 分単位
            }
        });

        // カロリー計算: METs × 体重(kg) × 時間(h)
        const avgMets = 5.0; // 中程度の強度
        const calories = Math.round(avgMets * weight * (totalDuration / 60));

        return {
            volume: totalVolume,
            calories: calories,
            exerciseCount: todayRecords.length,
            totalSets: todayRecords.reduce((sum, r) => sum + (r.sets ? r.sets.length : 0), 0)
        };
    }

    // 停滞チェック
    static checkStagnation() {
        const profile = this.getUserProfile();
        if (!profile) return [];

        const stagnationWeeks = STAGNATION_WEEKS[profile.experience] || 6;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - (stagnationWeeks * 7));

        const history = this.getWorkoutHistory();
        const exercises = this.getAllExercises();
        const alerts = [];

        // 種目ごとに最大重量の推移をチェック
        const exerciseMaxWeights = {};

        history.forEach(record => {
            const exerciseId = record.exerciseId;
            if (!exerciseMaxWeights[exerciseId]) {
                exerciseMaxWeights[exerciseId] = [];
            }

            if (record.sets && record.sets.length > 0) {
                const maxWeight = Math.max(...record.sets.map(s => s.weight));
                exerciseMaxWeights[exerciseId].push({
                    date: new Date(record.date),
                    maxWeight: maxWeight
                });
            }
        });

        // 各種目の停滞をチェック
        Object.keys(exerciseMaxWeights).forEach(exerciseId => {
            const records = exerciseMaxWeights[exerciseId]
                .sort((a, b) => a.date - b.date);

            if (records.length < 2) return;

            // 最近の記録
            const recentRecords = records.filter(r => r.date >= cutoffDate);
            const olderRecords = records.filter(r => r.date < cutoffDate);

            if (recentRecords.length === 0 || olderRecords.length === 0) return;

            const recentMax = Math.max(...recentRecords.map(r => r.maxWeight));
            const olderMax = Math.max(...olderRecords.map(r => r.maxWeight));

            // 重量が上がっていない場合
            if (recentMax <= olderMax) {
                const exercise = exercises.find(e => e.id === exerciseId);
                if (exercise) {
                    alerts.push({
                        exerciseId: exerciseId,
                        exerciseName: exercise.name,
                        currentMax: recentMax,
                        weeks: stagnationWeeks
                    });
                }
            }
        });

        return alerts;
    }

    // データエクスポート
    static exportData() {
        const data = {
            profile: this.getUserProfile(),
            exerciseSettings: this.getAllExerciseSettings(),
            workoutHistory: this.getWorkoutHistory(),
            routines: this.getRoutines(),
            customExercises: this.getCustomExercises(),
            exportDate: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    }

    // データインポート
    static importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);

            if (data.profile) {
                localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(data.profile));
            }
            if (data.exerciseSettings) {
                localStorage.setItem(STORAGE_KEYS.EXERCISE_SETTINGS, JSON.stringify(data.exerciseSettings));
            }
            if (data.workoutHistory) {
                localStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(data.workoutHistory));
            }
            if (data.routines) {
                localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(data.routines));
            }
            if (data.customExercises) {
                localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(data.customExercises));
            }

            return true;
        } catch (e) {
            console.error('Import failed:', e);
            return false;
        }
    }

    // 全データ削除
    static clearAllData() {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }
}
