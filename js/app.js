// FORGE - Main Application

class ForgeApp {
    constructor() {
        this.currentScreen = 'home';
        this.currentExercise = null;
        this.currentRoutine = null;
        this.routineExerciseIndex = 0;
        this.currentSets = [];
        this.selectedMuscleGroup = null;
        this.editingRoutine = null;
        this.routineExercises = [];

        this.init();
    }

    init() {
        // プロフィールチェック
        const profile = Storage.getUserProfile();
        if (!profile) {
            this.showSetupScreen();
        } else {
            this.showApp();
        }

        this.bindEvents();
        this.registerServiceWorker();
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('sw.js');
                console.log('Service Worker registered');
            } catch (e) {
                console.log('Service Worker registration failed:', e);
            }
        }
    }

    bindEvents() {
        // Setup Screen
        document.querySelectorAll('#experience-select .select-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectExperience(btn));
        });

        document.getElementById('user-weight').addEventListener('input', () => {
            this.validateSetupForm();
        });

        document.getElementById('setup-complete-btn').addEventListener('click', () => {
            this.completeSetup();
        });

        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const screen = btn.dataset.screen;
                this.navigateTo(screen);
            });
        });

        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const back = btn.dataset.back;
                if (back) {
                    this.navigateTo(back);
                }
            });
        });

        // Home Screen
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.navigateTo('settings');
        });

        document.getElementById('start-routine-btn').addEventListener('click', () => {
            this.navigateTo('routines');
        });

        document.getElementById('start-free-btn').addEventListener('click', () => {
            this.navigateTo('exercise-select');
        });

        // Exercise Select
        document.getElementById('exercise-search').addEventListener('input', (e) => {
            this.filterExercises(e.target.value);
        });

        document.getElementById('add-exercise-btn').addEventListener('click', () => {
            this.showAddExerciseModal();
        });

        // Training Screen
        document.getElementById('training-back-btn').addEventListener('click', () => {
            this.exitTraining();
        });

        document.getElementById('exercise-settings-btn').addEventListener('click', () => {
            this.showExerciseSettings();
        });

        document.querySelectorAll('.adjust-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.target;
                const delta = parseFloat(btn.dataset.delta);
                this.adjustInput(target, delta);
            });
        });

        document.getElementById('toggle-memo-btn').addEventListener('click', () => {
            this.toggleMemo();
        });

        document.getElementById('record-set-btn').addEventListener('click', () => {
            this.recordSet();
        });

        document.getElementById('skip-timer-btn').addEventListener('click', () => {
            timer.skip();
        });

        // Exercise Settings Modal
        document.querySelectorAll('#rest-time-options button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectRestTime(parseInt(btn.dataset.seconds));
            });
        });

        document.getElementById('close-exercise-settings').addEventListener('click', () => {
            this.hideExerciseSettings();
        });

        // Add Exercise Modal
        document.getElementById('cancel-add-exercise').addEventListener('click', () => {
            this.hideAddExerciseModal();
        });

        document.getElementById('confirm-add-exercise').addEventListener('click', () => {
            this.addCustomExercise();
        });

        // Routine Screen
        document.getElementById('add-routine-btn').addEventListener('click', () => {
            this.createNewRoutine();
        });

        // Routine Edit Screen
        document.getElementById('save-routine-btn').addEventListener('click', () => {
            this.saveRoutine();
        });

        document.getElementById('add-routine-exercise-btn').addEventListener('click', () => {
            this.addExerciseToRoutine();
        });

        // Settings
        document.getElementById('settings-weight').addEventListener('change', (e) => {
            this.updateUserWeight(parseFloat(e.target.value));
        });

        document.getElementById('settings-experience').addEventListener('change', (e) => {
            this.updateUserExperience(e.target.value);
        });

        document.getElementById('export-data-btn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('import-data-btn').addEventListener('click', () => {
            this.importData();
        });

        document.getElementById('clear-data-btn').addEventListener('click', () => {
            this.clearData();
        });

        // Stats Screen
        document.getElementById('stats-exercise-select').addEventListener('change', (e) => {
            this.loadExerciseStats(e.target.value);
        });
    }

    // ==================== Setup ====================

    showSetupScreen() {
        document.getElementById('setup-screen').classList.remove('hidden');
        document.getElementById('app').classList.add('hidden');
    }

    showApp() {
        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        this.loadHomeScreen();
    }

    selectExperience(btn) {
        document.querySelectorAll('#experience-select .select-btn').forEach(b => {
            b.classList.remove('active');
        });
        btn.classList.add('active');
        this.validateSetupForm();
    }

    validateSetupForm() {
        const experience = document.querySelector('#experience-select .select-btn.active');
        const weight = document.getElementById('user-weight').value;
        const btn = document.getElementById('setup-complete-btn');

        btn.disabled = !(experience && weight && parseFloat(weight) > 0);
    }

    completeSetup() {
        const experience = document.querySelector('#experience-select .select-btn.active').dataset.value;
        const weight = parseFloat(document.getElementById('user-weight').value);

        Storage.saveUserProfile({
            experience: experience,
            weight: weight,
            createdAt: new Date().toISOString()
        });

        this.showApp();
    }

    // ==================== Navigation ====================

    navigateTo(screen) {
        // 現在の画面を非表示
        document.querySelectorAll('.screen').forEach(s => {
            s.classList.remove('active');
        });

        // 新しい画面を表示
        const screenEl = document.getElementById(`${screen}-screen`);
        if (screenEl) {
            screenEl.classList.add('active');
            this.currentScreen = screen;
        }

        // ナビゲーションのアクティブ状態を更新
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.screen === screen);
        });

        // 画面固有の初期化
        switch (screen) {
            case 'home':
                this.loadHomeScreen();
                break;
            case 'routines':
                this.loadRoutinesScreen();
                break;
            case 'exercise-select':
                this.loadExerciseSelectScreen();
                break;
            case 'stats':
                this.loadStatsScreen();
                break;
            case 'history':
                this.loadHistoryScreen();
                break;
            case 'settings':
                this.loadSettingsScreen();
                break;
        }
    }

    // ==================== Home Screen ====================

    loadHomeScreen() {
        // 今日の統計を更新
        const stats = Storage.getTodayStats();
        document.getElementById('today-volume').textContent = stats.volume.toLocaleString();
        document.getElementById('today-calories').textContent = stats.calories;

        // 停滞アラートをチェック
        const alerts = Storage.checkStagnation();
        const alertsSection = document.getElementById('stagnation-alerts');
        const alertsList = document.getElementById('alerts-list');

        if (alerts.length > 0) {
            alertsSection.classList.remove('hidden');
            alertsList.innerHTML = alerts.map(alert => `
                <div class="alert-item">
                    <strong>${alert.exerciseName}</strong>が${alert.weeks}週間以上 ${alert.currentMax}kg で停滞中
                </div>
            `).join('');
        } else {
            alertsSection.classList.add('hidden');
        }
    }

    // ==================== Exercise Select ====================

    loadExerciseSelectScreen() {
        this.renderMuscleGroups();
        this.renderExercises();
    }

    renderMuscleGroups() {
        const container = document.getElementById('muscle-groups');
        const categories = ['全て', ...MUSCLE_CATEGORIES];

        container.innerHTML = categories.map(cat => `
            <button class="muscle-group-btn ${cat === '全て' && !this.selectedMuscleGroup ? 'active' : ''}"
                    data-category="${cat === '全て' ? '' : cat}">
                ${cat}
            </button>
        `).join('');

        container.querySelectorAll('.muscle-group-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.muscle-group-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedMuscleGroup = btn.dataset.category || null;
                this.renderExercises();
            });
        });
    }

    renderExercises(searchQuery = '') {
        const container = document.getElementById('exercises-list');
        let exercises = Storage.getAllExercises();

        // カテゴリフィルタ
        if (this.selectedMuscleGroup) {
            exercises = exercises.filter(e => {
                const muscle = MUSCLE_GROUPS[e.muscle];
                return muscle && muscle.category === this.selectedMuscleGroup;
            });
        }

        // 検索フィルタ
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            exercises = exercises.filter(e => e.name.toLowerCase().includes(query));
        }

        if (exercises.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <p>種目が見つかりません</p>
                </div>
            `;
            return;
        }

        // 部位ごとにグループ化
        const grouped = {};
        exercises.forEach(ex => {
            const muscle = MUSCLE_GROUPS[ex.muscle];
            const muscleName = muscle ? muscle.name : '未分類';
            if (!grouped[muscleName]) {
                grouped[muscleName] = [];
            }
            grouped[muscleName].push(ex);
        });

        container.innerHTML = Object.entries(grouped).map(([muscleName, exs]) => `
            <div class="exercise-group">
                <h4 style="font-size: 12px; color: var(--text-muted); margin: 16px 0 8px; text-transform: uppercase;">${muscleName}</h4>
                ${exs.map(ex => `
                    <div class="exercise-item" data-id="${ex.id}">
                        <div class="exercise-info">
                            <h4>${ex.name}</h4>
                            <span>${ex.isCustom ? 'カスタム' : ''}</span>
                        </div>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 18l6-6-6-6"/>
                        </svg>
                    </div>
                `).join('')}
            </div>
        `).join('');

        container.querySelectorAll('.exercise-item').forEach(item => {
            item.addEventListener('click', () => {
                const exerciseId = item.dataset.id;
                this.startExercise(exerciseId);
            });
        });
    }

    filterExercises(query) {
        this.renderExercises(query);
    }

    // ==================== Training ====================

    startExercise(exerciseId) {
        const exercises = Storage.getAllExercises();
        this.currentExercise = exercises.find(e => e.id === exerciseId);

        if (!this.currentExercise) return;

        this.currentSets = [];

        // 画面を表示
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('training-screen').classList.add('active');

        // 種目名を設定
        document.getElementById('current-exercise-name').textContent = this.currentExercise.name;

        // 前回の記録を取得して入力値を設定
        const lastRecord = Storage.getLastRecord(exerciseId);
        const settings = Storage.getExerciseSettings(exerciseId);

        if (lastRecord && lastRecord.sets && lastRecord.sets.length > 0) {
            const lastSet = lastRecord.sets[0];
            document.getElementById('weight-input').value = lastSet.weight;
            document.getElementById('reps-input').value = lastSet.reps;
        } else {
            document.getElementById('weight-input').value = 20;
            document.getElementById('reps-input').value = 10;
        }

        // メモを設定
        document.getElementById('exercise-memo').value = settings.memo || '';

        // 過去の記録を表示
        this.renderPastRecords();

        // 完了セットをクリア
        this.renderCompletedSets();

        // セット番号をリセット
        document.getElementById('current-set-num').textContent = '1';

        // メモを閉じる
        document.getElementById('exercise-memo').classList.add('hidden');
        document.getElementById('toggle-memo-btn').classList.remove('active');
    }

    renderPastRecords() {
        const container = document.getElementById('past-records-list');
        const history = Storage.getExerciseHistory(this.currentExercise.id, 5);

        if (history.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); font-size: 14px;">まだ記録がありません</p>';
            return;
        }

        container.innerHTML = history.map(record => {
            const date = new Date(record.date);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
            const setsStr = record.sets.map(s => `${s.weight}kg×${s.reps}`).join(', ');

            return `
                <div class="past-record-item">
                    <span class="past-record-date">${dateStr}</span>
                    <span class="past-record-sets">${setsStr}</span>
                </div>
            `;
        }).join('');
    }

    renderCompletedSets() {
        const container = document.getElementById('sets-list');

        if (this.currentSets.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); font-size: 14px;">セットを記録してください</p>';
            return;
        }

        container.innerHTML = this.currentSets.map((set, index) => `
            <div class="set-done-item">
                <div class="set-done-num">${index + 1}</div>
                <div class="set-done-details">${set.weight}kg × ${set.reps}回</div>
                <button class="set-done-delete" data-index="${index}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        `).join('');

        container.querySelectorAll('.set-done-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                this.deleteSet(index);
            });
        });
    }

    adjustInput(target, delta) {
        const input = document.getElementById(`${target}-input`);
        const currentValue = parseFloat(input.value) || 0;
        const newValue = Math.max(0, currentValue + delta);
        input.value = target === 'weight' ? newValue.toFixed(1).replace(/\.0$/, '') : newValue;
    }

    toggleMemo() {
        const memo = document.getElementById('exercise-memo');
        const btn = document.getElementById('toggle-memo-btn');
        memo.classList.toggle('hidden');
        btn.classList.toggle('active');
    }

    recordSet() {
        const weight = parseFloat(document.getElementById('weight-input').value) || 0;
        const reps = parseInt(document.getElementById('reps-input').value) || 0;

        if (weight <= 0 || reps <= 0) {
            return;
        }

        // セットを追加
        this.currentSets.push({ weight, reps });

        // 次のセット番号を更新
        document.getElementById('current-set-num').textContent = this.currentSets.length + 1;

        // 完了セットを更新
        this.renderCompletedSets();

        // メモを保存
        const memo = document.getElementById('exercise-memo').value;
        Storage.saveExerciseSettings(this.currentExercise.id, { memo });

        // 休憩タイマーを開始
        const settings = Storage.getExerciseSettings(this.currentExercise.id);
        this.startRestTimer(settings.restTime || 90);
    }

    deleteSet(index) {
        this.currentSets.splice(index, 1);
        document.getElementById('current-set-num').textContent = this.currentSets.length + 1;
        this.renderCompletedSets();
    }

    startRestTimer(seconds) {
        const overlay = document.getElementById('timer-overlay');
        const display = document.getElementById('timer-value');

        overlay.classList.remove('hidden');

        timer.start(seconds,
            // onTick
            (remaining) => {
                display.textContent = TimerManager.formatTime(remaining);
            },
            // onComplete
            () => {
                overlay.classList.add('hidden');
            }
        );
    }

    exitTraining() {
        // 記録を保存
        if (this.currentSets.length > 0) {
            Storage.addWorkoutRecord({
                exerciseId: this.currentExercise.id,
                exerciseName: this.currentExercise.name,
                sets: [...this.currentSets]
            });
        }

        // タイマーを停止
        timer.stop();
        document.getElementById('timer-overlay').classList.add('hidden');

        // ルーティン中の場合
        if (this.currentRoutine) {
            this.routineExerciseIndex++;
            if (this.routineExerciseIndex < this.currentRoutine.exercises.length) {
                // 次の種目へ
                const nextExerciseId = this.currentRoutine.exercises[this.routineExerciseIndex];
                this.startExercise(nextExerciseId);
                return;
            } else {
                // ルーティン完了
                this.currentRoutine = null;
                this.routineExerciseIndex = 0;
            }
        }

        // ホームに戻る
        this.navigateTo('home');
    }

    // ==================== Exercise Settings ====================

    showExerciseSettings() {
        const modal = document.getElementById('exercise-settings-modal');
        const settings = Storage.getExerciseSettings(this.currentExercise.id);

        // 現在の休憩時間を選択
        document.querySelectorAll('#rest-time-options button').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.seconds) === settings.restTime);
        });

        modal.classList.remove('hidden');
    }

    hideExerciseSettings() {
        document.getElementById('exercise-settings-modal').classList.add('hidden');
    }

    selectRestTime(seconds) {
        Storage.saveExerciseSettings(this.currentExercise.id, { restTime: seconds });

        document.querySelectorAll('#rest-time-options button').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.seconds) === seconds);
        });
    }

    // ==================== Custom Exercise ====================

    showAddExerciseModal() {
        const modal = document.getElementById('add-exercise-modal');
        const select = document.getElementById('custom-exercise-muscle');

        // 部位選択肢を生成
        select.innerHTML = Object.values(MUSCLE_GROUPS).map(muscle => `
            <option value="${muscle.id}">${muscle.name}</option>
        `).join('');

        document.getElementById('custom-exercise-name').value = '';
        modal.classList.remove('hidden');
    }

    hideAddExerciseModal() {
        document.getElementById('add-exercise-modal').classList.add('hidden');
    }

    addCustomExercise() {
        const name = document.getElementById('custom-exercise-name').value.trim();
        const muscle = document.getElementById('custom-exercise-muscle').value;

        if (!name) return;

        Storage.addCustomExercise({ name, muscle });
        this.hideAddExerciseModal();
        this.renderExercises();
    }

    // ==================== Routines ====================

    loadRoutinesScreen() {
        const container = document.getElementById('routines-list');
        const routines = Storage.getRoutines();

        if (routines.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <p>ルーティンがありません</p>
                    <p style="margin-top: 8px;">「+」ボタンで作成できます</p>
                </div>
            `;
            return;
        }

        const exercises = Storage.getAllExercises();

        container.innerHTML = routines.map(routine => {
            const exerciseNames = routine.exercises
                .map(id => exercises.find(e => e.id === id))
                .filter(e => e)
                .map(e => e.name)
                .slice(0, 3);
            const moreCount = routine.exercises.length - 3;

            return `
                <div class="routine-item" data-id="${routine.id}">
                    <div class="routine-info">
                        <h4>${routine.name}</h4>
                        <span>${exerciseNames.join(', ')}${moreCount > 0 ? ` 他${moreCount}種目` : ''}</span>
                    </div>
                    <div class="routine-actions">
                        <button class="routine-action-btn edit-routine" data-id="${routine.id}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="routine-action-btn delete-routine" data-id="${routine.id}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // イベントバインド
        container.querySelectorAll('.routine-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.routine-actions')) {
                    this.startRoutine(item.dataset.id);
                }
            });
        });

        container.querySelectorAll('.edit-routine').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editRoutine(btn.dataset.id);
            });
        });

        container.querySelectorAll('.delete-routine').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('このルーティンを削除しますか？')) {
                    Storage.deleteRoutine(btn.dataset.id);
                    this.loadRoutinesScreen();
                }
            });
        });
    }

    startRoutine(routineId) {
        const routines = Storage.getRoutines();
        this.currentRoutine = routines.find(r => r.id === routineId);

        if (!this.currentRoutine || this.currentRoutine.exercises.length === 0) {
            return;
        }

        this.routineExerciseIndex = 0;
        this.startExercise(this.currentRoutine.exercises[0]);
    }

    createNewRoutine() {
        this.editingRoutine = null;
        this.routineExercises = [];

        document.getElementById('routine-edit-title').textContent = 'ルーティン作成';
        document.getElementById('routine-name-input').value = '';
        this.renderRoutineExercises();

        this.navigateTo('routine-edit');
    }

    editRoutine(routineId) {
        const routines = Storage.getRoutines();
        this.editingRoutine = routines.find(r => r.id === routineId);

        if (!this.editingRoutine) return;

        this.routineExercises = [...this.editingRoutine.exercises];

        document.getElementById('routine-edit-title').textContent = 'ルーティン編集';
        document.getElementById('routine-name-input').value = this.editingRoutine.name;
        this.renderRoutineExercises();

        this.navigateTo('routine-edit');
    }

    renderRoutineExercises() {
        const container = document.getElementById('routine-exercises-list');
        const exercises = Storage.getAllExercises();

        if (this.routineExercises.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); font-size: 14px; text-align: center; padding: 20px;">種目を追加してください</p>';
            return;
        }

        container.innerHTML = this.routineExercises.map((exerciseId, index) => {
            const exercise = exercises.find(e => e.id === exerciseId);
            if (!exercise) return '';

            return `
                <div class="routine-exercise-item" data-index="${index}">
                    <div class="drag-handle">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                        </svg>
                    </div>
                    <span class="exercise-name">${exercise.name}</span>
                    <button class="remove-btn" data-index="${index}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                this.routineExercises.splice(index, 1);
                this.renderRoutineExercises();
            });
        });
    }

    addExerciseToRoutine() {
        // 種目選択画面を表示（選択モード）
        this.loadExerciseSelectScreen();

        // 一時的にクリックハンドラを変更
        const exercisesList = document.getElementById('exercises-list');
        const originalHandler = () => { };

        const selectHandler = (e) => {
            const item = e.target.closest('.exercise-item');
            if (item) {
                const exerciseId = item.dataset.id;
                this.routineExercises.push(exerciseId);
                this.renderRoutineExercises();
                this.navigateTo('routine-edit');
                exercisesList.removeEventListener('click', selectHandler);
            }
        };

        exercisesList.addEventListener('click', selectHandler);

        // 戻るボタンの挙動を変更
        const backBtn = document.querySelector('#exercise-select-screen .back-btn');
        backBtn.dataset.back = 'routine-edit';

        this.navigateTo('exercise-select');
    }

    saveRoutine() {
        const name = document.getElementById('routine-name-input').value.trim();

        if (!name || this.routineExercises.length === 0) {
            alert('ルーティン名と種目を入力してください');
            return;
        }

        const routine = {
            id: this.editingRoutine ? this.editingRoutine.id : null,
            name: name,
            exercises: [...this.routineExercises]
        };

        Storage.saveRoutine(routine);
        this.navigateTo('routines');
    }

    // ==================== Stats ====================

    loadStatsScreen() {
        const select = document.getElementById('stats-exercise-select');
        const exercises = Storage.getAllExercises();
        const history = Storage.getWorkoutHistory();

        // 記録がある種目だけ表示
        const exerciseIds = [...new Set(history.map(r => r.exerciseId))];
        const exercisesWithHistory = exercises.filter(e => exerciseIds.includes(e.id));

        select.innerHTML = '<option value="">種目を選択...</option>' +
            exercisesWithHistory.map(e => `<option value="${e.id}">${e.name}</option>`).join('');

        // グラフをクリア
        this.clearChart();
        document.getElementById('stats-summary').innerHTML = '';
    }

    loadExerciseStats(exerciseId) {
        if (!exerciseId) {
            this.clearChart();
            return;
        }

        const history = Storage.getExerciseHistory(exerciseId, 30);

        if (history.length === 0) {
            this.clearChart();
            return;
        }

        // データを日付順にソート
        const sortedHistory = history.sort((a, b) => new Date(a.date) - new Date(b.date));

        // 最大重量の推移
        const labels = [];
        const data = [];

        sortedHistory.forEach(record => {
            const date = new Date(record.date);
            labels.push(`${date.getMonth() + 1}/${date.getDate()}`);

            const maxWeight = Math.max(...record.sets.map(s => s.weight));
            data.push(maxWeight);
        });

        this.renderChart(labels, data);

        // 統計サマリー
        const maxWeight = Math.max(...data);
        const latestWeight = data[data.length - 1];
        const totalVolume = sortedHistory.reduce((sum, r) =>
            sum + r.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0);

        document.getElementById('stats-summary').innerHTML = `
            <div class="stats-item">
                <span class="stats-item-label">最大重量</span>
                <span class="stats-item-value">${maxWeight} kg</span>
            </div>
            <div class="stats-item">
                <span class="stats-item-label">直近の重量</span>
                <span class="stats-item-value">${latestWeight} kg</span>
            </div>
            <div class="stats-item">
                <span class="stats-item-label">総ボリューム</span>
                <span class="stats-item-value">${totalVolume.toLocaleString()} kg</span>
            </div>
            <div class="stats-item">
                <span class="stats-item-label">記録回数</span>
                <span class="stats-item-value">${sortedHistory.length} 回</span>
            </div>
        `;
    }

    renderChart(labels, data) {
        const canvas = document.getElementById('progress-chart');
        const ctx = canvas.getContext('2d');

        // キャンバスサイズを設定
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        const padding = 40;
        const width = canvas.width - padding * 2;
        const height = canvas.height - padding * 2;

        // クリア
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (data.length === 0) return;

        const maxValue = Math.max(...data);
        const minValue = Math.min(...data);
        const range = maxValue - minValue || 1;

        // グリッドを描画
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        for (let i = 0; i <= 4; i++) {
            const y = padding + (height / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();

            // ラベル
            const value = maxValue - (range / 4) * i;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(Math.round(value) + 'kg', padding - 5, y + 4);
        }

        // データポイントを描画
        const points = data.map((value, index) => ({
            x: padding + (width / (data.length - 1 || 1)) * index,
            y: padding + height - ((value - minValue) / range) * height
        }));

        // グラデーション
        const gradient = ctx.createLinearGradient(0, padding, 0, canvas.height - padding);
        gradient.addColorStop(0, 'rgba(233, 69, 96, 0.3)');
        gradient.addColorStop(1, 'rgba(233, 69, 96, 0)');

        // 塗りつぶし
        ctx.beginPath();
        ctx.moveTo(points[0].x, canvas.height - padding);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(points[points.length - 1].x, canvas.height - padding);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // 線を描画
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.strokeStyle = '#e94560';
        ctx.lineWidth = 2;
        ctx.stroke();

        // ポイントを描画
        points.forEach((p, i) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#e94560';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // X軸ラベル（間引き）
        const labelStep = Math.ceil(labels.length / 6);
        labels.forEach((label, i) => {
            if (i % labelStep === 0 || i === labels.length - 1) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.font = '10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(label, points[i].x, canvas.height - padding + 15);
            }
        });
    }

    clearChart() {
        const canvas = document.getElementById('progress-chart');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // ==================== History ====================

    loadHistoryScreen() {
        const container = document.getElementById('history-list');
        const history = Storage.getWorkoutHistory();

        if (history.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <p>まだ記録がありません</p>
                </div>
            `;
            return;
        }

        // 日付ごとにグループ化
        const grouped = {};
        history.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(record => {
            const date = new Date(record.date).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(record);
        });

        container.innerHTML = Object.entries(grouped).map(([date, records]) => `
            <div class="history-date">${date}</div>
            ${records.map(record => `
                <div class="history-item">
                    <h4>${record.exerciseName}</h4>
                    <div class="history-item-sets">
                        ${record.sets.map((s, i) => `${i + 1}. ${s.weight}kg × ${s.reps}回`).join(' / ')}
                    </div>
                </div>
            `).join('')}
        `).join('');
    }

    // ==================== Settings ====================

    loadSettingsScreen() {
        const profile = Storage.getUserProfile();
        if (profile) {
            document.getElementById('settings-weight').value = profile.weight;
            document.getElementById('settings-experience').value = profile.experience;
        }
    }

    updateUserWeight(weight) {
        const profile = Storage.getUserProfile();
        if (profile) {
            profile.weight = weight;
            Storage.saveUserProfile(profile);
        }
    }

    updateUserExperience(experience) {
        const profile = Storage.getUserProfile();
        if (profile) {
            profile.experience = experience;
            Storage.saveUserProfile(profile);
        }
    }

    exportData() {
        const data = Storage.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `forge-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();

        URL.revokeObjectURL(url);
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const success = Storage.importData(event.target.result);
                if (success) {
                    alert('データをインポートしました');
                    this.loadHomeScreen();
                } else {
                    alert('インポートに失敗しました');
                }
            };
            reader.readAsText(file);
        };

        input.click();
    }

    clearData() {
        if (confirm('すべてのデータを削除しますか？この操作は取り消せません。')) {
            Storage.clearAllData();
            location.reload();
        }
    }
}

// アプリ起動
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ForgeApp();
});
