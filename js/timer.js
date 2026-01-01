// FORGE - Timer Manager with Background Support

class TimerManager {
    constructor() {
        this.duration = 0;
        this.remaining = 0;
        this.isRunning = false;
        this.startTime = null;
        this.endTime = null;
        this.intervalId = null;
        this.onTick = null;
        this.onComplete = null;
        this.audioContext = null;
        this.notificationPermission = false;

        this.init();
    }

    async init() {
        // AudioContext の初期化（ユーザーインタラクション後に有効化）
        this.setupAudioContext();

        // 通知の許可をリクエスト
        await this.requestNotificationPermission();

        // ページがバックグラウンドから復帰した時の処理
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isRunning) {
                this.syncTimer();
            }
        });

        // ページがフォーカスを取り戻した時
        window.addEventListener('focus', () => {
            if (this.isRunning) {
                this.syncTimer();
            }
        });
    }

    setupAudioContext() {
        // ユーザーインタラクション時に初期化
        const initAudio = () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            document.removeEventListener('touchstart', initAudio);
            document.removeEventListener('click', initAudio);
        };

        document.addEventListener('touchstart', initAudio, { once: true });
        document.addEventListener('click', initAudio, { once: true });
    }

    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            this.notificationPermission = permission === 'granted';
        }
    }

    start(seconds, onTick, onComplete) {
        this.stop();

        this.duration = seconds;
        this.remaining = seconds;
        this.startTime = Date.now();
        this.endTime = this.startTime + (seconds * 1000);
        this.isRunning = true;
        this.onTick = onTick;
        this.onComplete = onComplete;

        // LocalStorageにタイマー状態を保存（バックグラウンド復帰用）
        this.saveTimerState();

        // 更新間隔を100msに設定（より正確な表示のため）
        this.intervalId = setInterval(() => {
            this.tick();
        }, 100);

        // 初回のtick
        if (this.onTick) {
            this.onTick(this.remaining);
        }

        // バックグラウンドでも動作するようにWorkerを使用
        this.scheduleNotification(seconds);
    }

    tick() {
        if (!this.isRunning) return;

        const now = Date.now();
        this.remaining = Math.max(0, Math.ceil((this.endTime - now) / 1000));

        if (this.onTick) {
            this.onTick(this.remaining);
        }

        if (this.remaining <= 0) {
            this.complete();
        }
    }

    syncTimer() {
        // バックグラウンドから復帰した時に時間を同期
        if (!this.isRunning || !this.endTime) return;

        const now = Date.now();
        this.remaining = Math.max(0, Math.ceil((this.endTime - now) / 1000));

        if (this.remaining <= 0) {
            this.complete();
        } else if (this.onTick) {
            this.onTick(this.remaining);
        }
    }

    complete() {
        this.isRunning = false;
        this.clearTimerState();

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        // 音を鳴らす
        this.playSound();

        // バイブレーション
        this.vibrate();

        // コールバック
        if (this.onComplete) {
            this.onComplete();
        }
    }

    stop() {
        this.isRunning = false;
        this.clearTimerState();

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    skip() {
        this.stop();
        if (this.onComplete) {
            this.onComplete();
        }
    }

    saveTimerState() {
        localStorage.setItem('forge_timer_state', JSON.stringify({
            endTime: this.endTime,
            duration: this.duration
        }));
    }

    clearTimerState() {
        localStorage.removeItem('forge_timer_state');
    }

    restoreTimerState() {
        const state = localStorage.getItem('forge_timer_state');
        if (!state) return null;

        try {
            const { endTime, duration } = JSON.parse(state);
            const now = Date.now();

            if (endTime > now) {
                return {
                    remaining: Math.ceil((endTime - now) / 1000),
                    duration: duration
                };
            } else {
                this.clearTimerState();
                return { remaining: 0, duration: duration };
            }
        } catch (e) {
            this.clearTimerState();
            return null;
        }
    }

    playSound() {
        // Web Audio APIを使用して音を生成
        if (this.audioContext) {
            try {
                // Resume if suspended
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }

                // 2回のビープ音
                this.playBeep(0);
                this.playBeep(200);
                this.playBeep(400);
            } catch (e) {
                console.error('Audio playback failed:', e);
            }
        }

        // フォールバック: HTML Audio要素
        const audio = document.getElementById('timer-sound');
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log('Audio play failed:', e));
        }
    }

    playBeep(delay = 0) {
        setTimeout(() => {
            if (!this.audioContext) return;

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = 880; // A5
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.15);
        }, delay);
    }

    vibrate() {
        if ('vibrate' in navigator) {
            // 振動パターン: 200ms振動、100ms休止、200ms振動
            navigator.vibrate([200, 100, 200, 100, 200]);
        }
    }

    scheduleNotification(seconds) {
        // バックグラウンド通知のスケジュール
        if (this.notificationPermission && 'serviceWorker' in navigator) {
            // Service Workerに通知をスケジュール
            navigator.serviceWorker.ready.then(registration => {
                // タイマー終了時刻を計算
                const endTime = Date.now() + (seconds * 1000);

                // Service Workerにメッセージを送信
                if (registration.active) {
                    registration.active.postMessage({
                        type: 'SCHEDULE_NOTIFICATION',
                        endTime: endTime,
                        title: 'FORGE',
                        body: '休憩終了！次のセットを始めましょう'
                    });
                }
            });
        }
    }

    // フォーマットユーティリティ
    static formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// グローバルインスタンス
const timer = new TimerManager();
