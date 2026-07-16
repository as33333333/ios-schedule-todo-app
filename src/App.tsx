import {
  Activity,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  Cloud,
  Edit3,
  Inbox,
  Layers3,
  ListChecks,
  LockKeyhole,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Timer,
  Trash2,
  UserRound,
  Wand2
} from 'lucide-react';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import scheduleAnalytics from './assets/schedule-analytics.png';
import scheduleHomePrimary from './assets/schedule-home-primary.png';
import scheduleHomeSecondary from './assets/schedule-home-secondary.png';

type Tab = 'home' | 'calendar' | 'focus' | 'analytics' | 'profile';
type Priority = 'P0' | 'P1' | 'P2';
type TodoType = '工作' | '日常' | '学习' | '健康';

type Todo = {
  id: number;
  title: string;
  priority: Priority;
  type: TodoType;
  progress: number;
  due: string;
  time?: string;
  note?: string;
  isTodayFocus?: boolean;
  isRecurring?: boolean;
  steps?: string[];
  lastProgress?: number;
  completedAt?: string;
};

const initialTodos: Todo[] = [
  {
    id: 1,
    title: '完成产品原型第一版',
    priority: 'P0',
    type: '工作',
    progress: 42,
    due: '今天 18:00',
    time: '10:00-11:30',
    note: '即将截止，当前进度较低',
    isTodayFocus: true,
    steps: ['梳理首页信息架构', '补齐日历拖动状态', '整理交互备注']
  },
  {
    id: 2,
    title: '整理本周复盘和下周重点',
    priority: 'P1',
    type: '工作',
    progress: 70,
    due: '今天 21:00',
    time: '16:00-17:00',
    isTodayFocus: true,
    steps: ['回顾完成事项', '列出阻碍', '确定下周 P0']
  },
  {
    id: 3,
    title: '阅读 30 分钟',
    priority: 'P2',
    type: '学习',
    progress: 20,
    due: '今天',
    isTodayFocus: true,
    isRecurring: true
  },
  {
    id: 4,
    title: '预约体检',
    priority: 'P1',
    type: '健康',
    progress: 0,
    due: '明天 12:00'
  },
  {
    id: 5,
    title: '处理发票和报销',
    priority: 'P2',
    type: '日常',
    progress: 10,
    due: '周五'
  }
];

const calendarBlocks = [
  { id: 1, title: '产品原型第一版', start: '10:00', end: '11:30', priority: 'P0', column: 0, columns: 1 },
  { id: 2, title: '团队同步', start: '14:00', end: '15:00', priority: 'P1', column: 0, columns: 2 },
  { id: 3, title: '竞品记录', start: '14:20', end: '15:20', priority: 'P2', column: 1, columns: 2 },
  { id: 4, title: '周复盘', start: '16:00', end: '17:00', priority: 'P1', column: 0, columns: 1 }
];

function formatTime(value: string) {
  return value ? value.slice(11, 16) : '';
}

function formatZhDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '今天';
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatZhShortDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '今天';
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatDisplayTime(value: string) {
  const [hour, minute] = value.split(':').map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return value;
  const period = hour < 12 ? '上午' : '下午';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${period} ${hour12}:${String(minute).padStart(2, '0')}`;
}

function formatTimer(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [todos, setTodos] = useState(initialTodos);
  const [groupBy, setGroupBy] = useState<'priority' | 'type'>('priority');
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('day');
  const [focusMode, setFocusMode] = useState<'down' | 'up'>('down');
  const [isFocusing, setIsFocusing] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionDraft, setReflectionDraft] = useState('');
  const [reflectionTodoDraft, setReflectionTodoDraft] = useState<Todo | undefined>();
  const [reflections, setReflections] = useState<string[]>([]);
  const [showTodoSheet, setShowTodoSheet] = useState(false);
  const [todoTitle, setTodoTitle] = useState('');
  const [todoPriority, setTodoPriority] = useState<Priority>('P1');
  const [todoType, setTodoType] = useState<TodoType>('工作');
  const [todoNote, setTodoNote] = useState('');
  const [todoAllDay, setTodoAllDay] = useState(false);
  const [todoStartDate, setTodoStartDate] = useState('2026-07-08');
  const [todoEndDate, setTodoEndDate] = useState('2026-07-08');
  const [todoStartTime, setTodoStartTime] = useState('04:00');
  const [todoEndTime, setTodoEndTime] = useState('05:00');
  const [todoRecurring, setTodoRecurring] = useState(false);
  const [todoRecurrenceRule, setTodoRecurrenceRule] = useState('每天');
  const [todoStepDraft, setTodoStepDraft] = useState('');
  const [todoSteps, setTodoSteps] = useState<string[]>([]);
  const [showAssociateSheet, setShowAssociateSheet] = useState(false);
  const [showCompletedBox, setShowCompletedBox] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [focusTodoId, setFocusTodoId] = useState<number | null>(null);
  const [nickname, setNickname] = useState(() => window.localStorage.getItem('schedule-todo-nickname') ?? '');
  const [nicknameDraft, setNicknameDraft] = useState(nickname);

  const todayFocus = todos.filter((todo) => todo.isTodayFocus && todo.progress < 100);
  const activeTodos = todos.filter((todo) => todo.progress < 100);
  const completedTodos = todos.filter((todo) => todo.progress === 100);
  const completedCount = completedTodos.length;
  const focusedTodo = focusTodoId === null ? undefined : todos.find((todo) => todo.id === focusTodoId);

  useEffect(() => {
    if (!showReflection) return;
    setReflectionTodoDraft(focusedTodo ? { ...focusedTodo } : undefined);
  }, [showReflection, focusedTodo?.id]);

  const groupedTodos = useMemo(() => {
    const keyList = groupBy === 'priority' ? ['P0', 'P1', 'P2'] : ['工作', '日常', '学习', '健康'];
    return keyList.map((key) => ({
      key,
      items: activeTodos.filter((todo) => (groupBy === 'priority' ? todo.priority === key : todo.type === key))
    }));
  }, [activeTodos, groupBy]);

  const completeTodo = (id: number) => {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              progress: 100,
              lastProgress: todo.progress >= 100 ? todo.lastProgress ?? 0 : todo.progress,
              completedAt: '刚刚完成'
            }
          : todo
      )
    );
  };

  const bumpProgress = (id: number) => {
    setTodos((current) =>
      current.map((todo) => (todo.id === id ? { ...todo, progress: Math.min(100, todo.progress + 25) } : todo))
    );
  };

  const updateProgress = (id: number, progress: number) => {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              progress,
              lastProgress: progress >= 100 ? (todo.progress >= 100 ? todo.lastProgress ?? 0 : todo.progress) : todo.lastProgress,
              completedAt: progress >= 100 ? '刚刚完成' : undefined
            }
          : todo
      )
    );
  };

  const restoreTodo = (id: number) => {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              progress: Math.min(todo.lastProgress ?? 0, 99),
              completedAt: undefined
            }
          : todo
      )
    );
  };

  const clearCompletedTodos = () => {
    setTodos((current) => current.filter((todo) => todo.progress < 100));
    setShowCompletedBox(false);
  };

  const addFocusTodo = () => {
    const nextId = Math.max(...todos.map((todo) => todo.id)) + 1;
    setTodos((current) => [
      {
        id: nextId,
        title: '新今日重点',
        priority: 'P1',
        type: '工作',
        progress: 0,
        due: '今天',
        isTodayFocus: true
      },
      ...current
    ]);
  };

  const createTodo = () => {
    const title = todoTitle.trim();
    if (!title) return;
    const nextId = Math.max(...todos.map((todo) => todo.id)) + 1;
    setTodos((current) => [
      {
        id: nextId,
        title,
        priority: todoPriority,
        type: todoType,
        progress: 0,
        due: todoAllDay ? formatZhShortDate(todoEndDate) : `${formatZhShortDate(todoEndDate)} ${formatDisplayTime(todoEndTime)}`,
        time: todoAllDay ? '全天' : `${todoStartTime}-${todoEndTime}`,
        note: todoNote || undefined,
        isTodayFocus: true,
        isRecurring: todoRecurring,
        steps: todoSteps
      },
      ...current
    ]);
    setTodoTitle('');
    setTodoPriority('P1');
    setTodoType('工作');
    setTodoNote('');
    setTodoAllDay(false);
    setTodoStartDate('2026-07-08');
    setTodoEndDate('2026-07-08');
    setTodoStartTime('04:00');
    setTodoEndTime('05:00');
    setTodoRecurring(false);
    setTodoRecurrenceRule('每天');
    setTodoStepDraft('');
    setTodoSteps([]);
    setShowTodoSheet(false);
  };

  const addManualStep = () => {
    const step = todoStepDraft.trim();
    if (!step) return;
    setTodoSteps((current) => [...current, step]);
    setTodoStepDraft('');
  };

  const splitStepsWithAI = () => {
    const base = todoTitle.trim() || '这个任务';
    setTodoSteps([
      `明确「${base}」的完成标准`,
      '拆出最小可执行动作',
      '安排第一段推进时间'
    ]);
  };

  const associateTodayFocus = (id: number) => {
    setTodos((current) => {
      const target = current.find((todo) => todo.id === id);
      if (!target) return current;
      return [{ ...target, isTodayFocus: true }, ...current.filter((todo) => todo.id !== id)];
    });
    setShowAssociateSheet(false);
  };

  const saveNickname = () => {
    const nextName = nicknameDraft.trim() || '朋友';
    setNickname(nextName);
    window.localStorage.setItem('schedule-todo-nickname', nextName);
  };

  const saveReflection = () => {
    const nextReflection = reflectionDraft.trim();
    if (nextReflection) {
      setReflections((current) => [nextReflection, ...current]);
    }
    if (reflectionTodoDraft) {
      setTodos((current) =>
        current.map((todo) =>
          todo.id === reflectionTodoDraft.id
            ? {
                ...todo,
                progress: reflectionTodoDraft.progress,
                lastProgress: reflectionTodoDraft.lastProgress,
                completedAt: reflectionTodoDraft.completedAt
              }
            : todo
        )
      );
    }
    setReflectionDraft('');
    setReflectionTodoDraft(undefined);
    setShowReflection(false);
    setIsFocusing(false);
    setIsPaused(false);
  };

  const skipReflection = () => {
    setReflectionDraft('');
    setReflectionTodoDraft(undefined);
    setShowReflection(false);
    setIsFocusing(false);
    setIsPaused(false);
  };

  const completeReflectionTodo = (id: number) => {
    setReflectionTodoDraft((current) =>
      current && current.id === id
        ? {
            ...current,
            progress: 100,
            lastProgress: current.progress >= 100 ? current.lastProgress ?? 0 : current.progress,
            completedAt: '刚刚完成'
          }
        : current
    );
  };

  const updateReflectionProgress = (id: number, progress: number) => {
    setReflectionTodoDraft((current) =>
      current && current.id === id
        ? {
            ...current,
            progress,
            lastProgress:
              progress >= 100 ? (current.progress >= 100 ? current.lastProgress ?? 0 : current.progress) : current.lastProgress,
            completedAt: progress >= 100 ? '刚刚完成' : undefined
          }
        : current
    );
  };

  return (
    <main className="app-shell">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />
      <section className="phone">
        <div className="status-bar">
          <span>9:41</span>
          <span className="status-pills">5G  86%</span>
        </div>

        <div className="screen">
          {activeTab === 'home' && (
            <HomeScreen
              todos={activeTodos}
              todayFocus={todayFocus}
              groupedTodos={groupedTodos}
              groupBy={groupBy}
              setGroupBy={setGroupBy}
              completeTodo={completeTodo}
              bumpProgress={bumpProgress}
              updateProgress={updateProgress}
              addFocusTodo={addFocusTodo}
              completedCount={completedCount}
              nickname={nickname}
              openTodoSheet={() => setShowTodoSheet(true)}
              openAssociateSheet={() => setShowAssociateSheet(true)}
              openCompletedBox={() => setShowCompletedBox(true)}
            />
          )}
          {activeTab === 'calendar' && <CalendarScreen view={calendarView} setView={setCalendarView} />}
          {activeTab === 'focus' && (
            <FocusScreen
              mode={focusMode}
              setMode={setFocusMode}
              isFocusing={isFocusing}
              setIsFocusing={setIsFocusing}
              isPaused={isPaused}
              setIsPaused={setIsPaused}
              setShowReflection={setShowReflection}
              todos={todayFocus}
              focusTodoId={focusTodoId}
              setFocusTodoId={setFocusTodoId}
              openTodoSheet={() => setShowTodoSheet(true)}
            />
          )}
          {activeTab === 'analytics' && <AnalyticsScreen />}
          {activeTab === 'profile' && <ProfileScreen nickname={nickname} reflections={reflections} />}
        </div>

        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} nickname={nickname} />
      </section>

      {!nickname && (
        <div className="sheet-backdrop">
          <section className="sheet floating-card glass-strong">
            <div className="sheet-title-row">
              <div>
                <p className="eyebrow">初次见面</p>
                <h2>怎么称呼你？</h2>
              </div>
              <UserRound size={28} color="#007AFF" />
            </div>
            <input
              className="text-input"
              value={nicknameDraft}
              onChange={(event) => setNicknameDraft(event.target.value)}
              placeholder="输入你的昵称"
              autoFocus
            />
            <button className="primary-button" onClick={saveNickname}>
              开始使用
            </button>
          </section>
        </div>
      )}

      {showReflection && (
        <div className="sheet-backdrop" onClick={() => setShowReflection(false)}>
          <section className="sheet glass-strong" onClick={(event) => event.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-title-row">
              <div>
                <p className="eyebrow">专注完成</p>
                <h2>写一点感想</h2>
              </div>
              <CheckCircle2 size={28} color="#34C759" />
            </div>
            {reflectionTodoDraft && (
              <section className="reflection-task-panel glass">
                <div className="section-heading compact-heading">
                  <div>
                    <p className="eyebrow">关联任务</p>
                    <h3>更新任务状态</h3>
                  </div>
                </div>
                <TodoRow
                  todo={reflectionTodoDraft}
                  completeTodo={completeReflectionTodo}
                  updateProgress={updateReflectionProgress}
                />
              </section>
            )}
            <textarea
              value={reflectionDraft}
              onChange={(event) => setReflectionDraft(event.target.value)}
              placeholder="这次专注有什么收获、阻碍或想法？"
            />
            <div className="reflection-actions">
              <button className="secondary-button glass" onClick={skipReflection}>
                就这样吧
              </button>
              <button className="primary-button" onClick={saveReflection}>
                我做完啦
              </button>
            </div>
          </section>
        </div>
      )}

      {showTodoSheet && (
        <div className="sheet-backdrop" onClick={() => setShowTodoSheet(false)}>
          <section className="sheet glass-strong" onClick={(event) => event.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-title-row">
              <div>
                <p className="eyebrow">新任务</p>
                <h2>添加今天要推进的事</h2>
              </div>
            </div>
            <input
              className="text-input"
              value={todoTitle}
              onChange={(event) => setTodoTitle(event.target.value)}
              placeholder="例如：整理原型反馈"
              autoFocus
            />
            <div className="form-row">
              <label>
                优先级
                <select value={todoPriority} onChange={(event) => setTodoPriority(event.target.value as Priority)}>
                  <option value="P0">P0</option>
                  <option value="P1">P1</option>
                  <option value="P2">P2</option>
                </select>
              </label>
              <label>
                类型
                <select value={todoType} onChange={(event) => setTodoType(event.target.value as TodoType)}>
                  <option value="工作">工作</option>
                  <option value="日常">日常</option>
                  <option value="学习">学习</option>
                  <option value="健康">健康</option>
                </select>
              </label>
            </div>
            <section className="schedule-card">
              <div className="calendar-toggle-row">
                <strong>全天</strong>
                <button
                  type="button"
                  className={`ios-switch ${todoAllDay ? 'on' : ''}`}
                  aria-label="全天"
                  onClick={() => setTodoAllDay(!todoAllDay)}
                >
                  <span />
                </button>
              </div>
              <div className="date-time-row">
                <strong>开始</strong>
                <div className="date-time-controls">
                  <select value={todoStartDate} onChange={(event) => setTodoStartDate(event.target.value)}>
                    <option value="2026-07-08">2026年7月8日</option>
                    <option value="2026-07-09">2026年7月9日</option>
                    <option value="2026-07-10">2026年7月10日</option>
                  </select>
                  {!todoAllDay && (
                    <select value={todoStartTime} onChange={(event) => setTodoStartTime(event.target.value)}>
                      <option value="04:00">上午 4:00</option>
                      <option value="09:00">上午 9:00</option>
                      <option value="10:00">上午 10:00</option>
                      <option value="14:00">下午 2:00</option>
                      <option value="16:00">下午 4:00</option>
                    </select>
                  )}
                </div>
              </div>
              <div className="mini-month">
                <div className="mini-month-title">2026年7月</div>
                {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                  <span className="mini-weekday" key={day}>{day}</span>
                ))}
                {Array.from({ length: 35 }, (_, index) => {
                  const date = index - 2;
                  if (date < 1 || date > 31) return <span className="mini-empty" key={index} />;
                  const value = `2026-07-${String(date).padStart(2, '0')}`;
                  return (
                    <button
                      type="button"
                      className={todoStartDate === value ? 'selected' : ''}
                      key={value}
                      onClick={() => {
                        setTodoStartDate(value);
                        setTodoEndDate(value);
                      }}
                    >
                      {date}
                    </button>
                  );
                })}
              </div>
              {!todoAllDay && (
                <div className="time-wheel">
                  <span>上午</span>
                  <strong>{todoStartTime.split(':')[0].replace(/^0/, '')}</strong>
                  <strong>{todoStartTime.split(':')[1]}</strong>
                </div>
              )}
              <div className="date-time-row end">
                <strong>结束</strong>
                <div className="date-time-controls">
                  <select value={todoEndDate} onChange={(event) => setTodoEndDate(event.target.value)}>
                    <option value="2026-07-08">2026年7月8日</option>
                    <option value="2026-07-09">2026年7月9日</option>
                    <option value="2026-07-10">2026年7月10日</option>
                  </select>
                  {!todoAllDay && (
                    <select value={todoEndTime} onChange={(event) => setTodoEndTime(event.target.value)}>
                      <option value="05:00">上午 5:00</option>
                      <option value="10:00">上午 10:00</option>
                      <option value="11:30">上午 11:30</option>
                      <option value="15:00">下午 3:00</option>
                      <option value="17:00">下午 5:00</option>
                    </select>
                  )}
                </div>
              </div>
            </section>
            <label className="toggle-row">
              <span>
                <strong>是否循环</strong>
                <small>开启后视为习惯</small>
              </span>
              <button
                type="button"
                className={`round-check ${todoRecurring ? 'on' : ''}`}
                aria-label="是否循环"
                onClick={() => setTodoRecurring(!todoRecurring)}
              />
            </label>
            {todoRecurring && (
              <label className="single-field">
                循环规则
                <select value={todoRecurrenceRule} onChange={(event) => setTodoRecurrenceRule(event.target.value)}>
                  <option value="每天">每天</option>
                  <option value="每周工作日">每周工作日</option>
                  <option value="每周一次">每周一次</option>
                </select>
              </label>
            )}
            <textarea
              className="todo-note"
              value={todoNote}
              onChange={(event) => setTodoNote(event.target.value)}
              placeholder="备注，可写背景、要求或提醒"
            />
            <section className="steps-box">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">具体步骤</p>
                  <h3>手动添加或 AI 拆分</h3>
                </div>
                <button type="button" className="small-action purple" onClick={splitStepsWithAI}>
                  <Wand2 size={14} />
                  AI
                </button>
              </div>
              <div className="step-input-row">
                <input
                  className="text-input compact-input"
                  value={todoStepDraft}
                  onChange={(event) => setTodoStepDraft(event.target.value)}
                  placeholder="输入一个步骤"
                />
                <button type="button" className="small-action" onClick={addManualStep}>
                  添加
                </button>
              </div>
              {todoSteps.length > 0 && (
                <div className="step-list">
                  {todoSteps.map((step, index) => (
                    <span key={`${step}-${index}`}>{step}</span>
                  ))}
                </div>
              )}
            </section>
            <button className="primary-button" onClick={createTodo}>
              创建任务
            </button>
          </section>
        </div>
      )}
      {showCompletedBox && (
        <CompletedBoxSheet
          completedTodos={completedTodos}
          restoreTodo={restoreTodo}
          clearCompletedTodos={clearCompletedTodos}
          close={() => setShowCompletedBox(false)}
        />
      )}
      {showAssociateSheet && (
        <div className="sheet-backdrop" onClick={() => setShowAssociateSheet(false)}>
          <section className="sheet glass-strong" onClick={(event) => event.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-title-row">
              <div>
                <p className="eyebrow">今日重点</p>
                <h2>关联已有任务</h2>
              </div>
            </div>
            <div className="associate-list">
              {activeTodos
                .filter((todo) => !todo.isTodayFocus)
                .map((todo) => (
                  <button key={todo.id} onClick={() => associateTodayFocus(todo.id)}>
                    <span>
                      <strong>{todo.title}</strong>
                      <small>{todo.type} · {todo.due}</small>
                    </span>
                    <span className={`priority-badge ${todo.priority.toLowerCase()}`}>{todo.priority}</span>
                  </button>
                ))}
              {activeTodos.filter((todo) => !todo.isTodayFocus).length === 0 && (
                <p className="empty-note">没有可关联的未完成任务</p>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function HomeScreen({
  todayFocus,
  groupedTodos,
  groupBy,
  setGroupBy,
  completeTodo,
  bumpProgress,
  updateProgress,
  addFocusTodo,
  completedCount,
  nickname,
  openTodoSheet,
  openAssociateSheet,
  openCompletedBox
}: {
  todos: Todo[];
  todayFocus: Todo[];
  groupedTodos: { key: string; items: Todo[] }[];
  groupBy: 'priority' | 'type';
  setGroupBy: (value: 'priority' | 'type') => void;
  completeTodo: (id: number) => void;
  bumpProgress: (id: number) => void;
  updateProgress: (id: number, progress: number) => void;
  addFocusTodo: () => void;
  completedCount: number;
  nickname: string;
  openTodoSheet: () => void;
  openAssociateSheet: () => void;
  openCompletedBox: () => void;
}) {
  return (
    <div className="page">
      <header className="hero-row">
        <div>
          <p className="date-label">7月7日 周二</p>
          <h1>你好 {nickname || '朋友'}</h1>
          <p className="summary">还有 {todayFocus.length + 2} 件事，其中 1 件 P0 需要推进</p>
        </div>
        <button className="icon-button glass" aria-label="创建任务" onClick={openTodoSheet}>
          <Plus size={22} />
        </button>
      </header>

      <section className="today-focus glass-strong">
        <div className="section-heading">
          <div>
            <p className="eyebrow">今日重点</p>
            <h2>今天只做几件事</h2>
          </div>
          <button className="small-action" onClick={openAssociateSheet}>
            <ListChecks size={15} />
            关联
          </button>
        </div>
        <div className="focus-list">
          {todayFocus.slice(0, 5).map((todo) => (
            <button className="focus-item" key={todo.id} onClick={() => bumpProgress(todo.id)}>
              <span className={`priority-dot ${todo.priority.toLowerCase()}`} />
              <span>{todo.title}</span>
              <span className="muted">{todo.time ?? '未安排时间'}</span>
            </button>
          ))}
          {todayFocus.length === 0 && <p className="empty-note">还没有今日重点，先关联一个任务。</p>}
        </div>
      </section>

      <div className="segmented glass">
        <button className={groupBy === 'priority' ? 'selected' : ''} onClick={() => setGroupBy('priority')}>
          按优先级
        </button>
        <button className={groupBy === 'type' ? 'selected' : ''} onClick={() => setGroupBy('type')}>
          按类型
        </button>
      </div>

      <div className="todo-groups">
        {groupedTodos.map((group) =>
          group.items.length ? (
            <section className="list-panel glass" key={group.key}>
              <h3>{group.key}</h3>
              {group.items.map((todo) => (
                <TodoRow
                  key={todo.id}
                  todo={todo}
                  completeTodo={completeTodo}
                  updateProgress={updateProgress}
                />
              ))}
            </section>
          ) : null
        )}
      </div>

      <button className="complete-box glass" onClick={openCompletedBox}>
        <Inbox size={18} />
        完成箱
        <span>{completedCount}</span>
      </button>
    </div>
  );
}

function CompletedBoxSheet({
  completedTodos,
  restoreTodo,
  clearCompletedTodos,
  close
}: {
  completedTodos: Todo[];
  restoreTodo: (id: number) => void;
  clearCompletedTodos: () => void;
  close: () => void;
}) {
  return (
    <div className="sheet-backdrop" onClick={close}>
      <section className="sheet glass-strong" onClick={(event) => event.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-title-row">
          <div>
            <p className="eyebrow">完成箱</p>
            <h2>已完成清单</h2>
          </div>
          <span className="completed-total">{completedTodos.length}</span>
        </div>
        <div className="completed-list">
          {completedTodos.map((todo) => (
            <article className="completed-item" key={todo.id}>
              <div>
                <strong>{todo.title}</strong>
                <p>{todo.completedAt ?? '已完成'} · {todo.type} · {todo.due}</p>
              </div>
              <button
                type="button"
                className="restore-button"
                onClick={() => restoreTodo(todo.id)}
              >
                <RotateCcw size={15} />
                恢复
              </button>
            </article>
          ))}
          {completedTodos.length === 0 && <p className="empty-note">完成的任务会收纳在这里。</p>}
        </div>
        <button
          className="danger-button"
          disabled={completedTodos.length === 0}
          onClick={clearCompletedTodos}
        >
          <Trash2 size={17} />
          清空完成箱
        </button>
      </section>
    </div>
  );
}

function TodoRow({
  todo,
  completeTodo,
  updateProgress
}: {
  todo: Todo;
  completeTodo: (id: number) => void;
  updateProgress: (id: number, progress: number) => void;
}) {
  const atRisk = todo.priority === 'P0' && todo.progress < 50;
  const isComplete = todo.progress === 100;
  return (
    <div className={`todo-row ${atRisk ? 'risk' : ''} ${isComplete ? 'completed' : ''}`}>
      <button className="check-button" onClick={() => completeTodo(todo.id)} aria-label="完成任务">
        {isComplete ? <CheckCircle2 size={23} /> : <Circle size={22} />}
      </button>
      <div className="todo-main">
        <div className="todo-title-line">
          <strong>{todo.title}</strong>
          <span className={`priority-badge ${todo.priority.toLowerCase()}`}>{todo.priority}</span>
        </div>
        <p>{todo.note ?? `${todo.type} · ${todo.due}`}</p>
      </div>
      <div className="progress-slider" aria-label="更新进度">
        <span>{todo.progress}%</span>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={todo.progress}
          onChange={(event) => updateProgress(todo.id, Number(event.target.value))}
        />
      </div>
    </div>
  );
}

function CalendarScreen({
  view,
  setView
}: {
  view: 'day' | 'week' | 'month';
  setView: (value: 'day' | 'week' | 'month') => void;
}) {
  const calendarTitle =
    view === 'day' ? '2026年7月8日' : view === 'week' ? '2026年7月5日 - 11日' : '2026年7月';
  const calendarSubtitle = view === 'day' ? '周三' : view === 'week' ? '周视图' : '月视图';

  return (
    <div className="page">
      <header className="hero-row compact">
        <div>
          <p className="date-label">日历 · {calendarSubtitle}</p>
          <h1 className="calendar-title">{calendarTitle}</h1>
        </div>
        <button className="icon-button glass" aria-label="新增日程">
          <Plus size={22} />
        </button>
      </header>

      <section className="schedule-collage glass" aria-label="日程管理预览拼图">
        <img className="collage-shot primary" src={scheduleHomePrimary} alt="首页任务管理预览" />
        <img className="collage-shot secondary" src={scheduleHomeSecondary} alt="今日重点预览" />
        <img className="collage-shot analytics" src={scheduleAnalytics} alt="分析页预览" />
      </section>

      <div className="segmented glass three">
        <button className={view === 'day' ? 'selected' : ''} onClick={() => setView('day')}>
          日
        </button>
        <button className={view === 'week' ? 'selected' : ''} onClick={() => setView('week')}>
          周
        </button>
        <button className={view === 'month' ? 'selected' : ''} onClick={() => setView('month')}>
          月
        </button>
      </div>

      {view === 'day' && <DayCalendar />}
      {view === 'week' && <WeekCalendar />}
      {view === 'month' && <MonthCalendar />}
    </div>
  );
}

function DayCalendar() {
  const stripDays = [
    { day: '日', date: 5 },
    { day: '一', date: 6 },
    { day: '二', date: 7 },
    { day: '三', date: 8 },
    { day: '四', date: 9 },
    { day: '五', date: 10 },
    { day: '六', date: 11 }
  ];
  const hours = ['上午 7时', '上午 8时', '上午 9时', '上午 10时', '上午 11时', '正午', '下午 1时', '下午 2时', '下午 3时', '下午 4时', '下午 5时', '下午 6时', '下午 7时', '下午 8时', '下午 9时'];
  return (
    <section className="day-calendar glass">
      <div className="day-strip">
        {stripDays.map((item) => (
          <button className={item.date === 8 ? 'selected' : ''} key={item.date}>
            <span>{item.day}</span>
            <strong>{item.date}</strong>
          </button>
        ))}
      </div>
      <div className="day-title-block">
        <h2>2026年7月8日 - 周三</h2>
        <p>丙午年五月廿四</p>
      </div>
      <div className="all-day-event">
        <span>全天</span>
        <strong>今天只做几件事</strong>
      </div>
      <div className="day-time-grid">
        {hours.map((time) => (
          <div className="day-time-line" key={time}>
            <span>{time}</span>
            <i />
          </div>
        ))}
        <div className="day-event p0">产品原型第一版</div>
        <div className="day-event p1">整理本周复盘</div>
      </div>
    </section>
  );
}

function WeekCalendar() {
  const days = [
    { label: '周日', date: 5 },
    { label: '周一', date: 6 },
    { label: '周二', date: 7 },
    { label: '周三', date: 8 },
    { label: '周四', date: 9 },
    { label: '周五', date: 10 },
    { label: '周六', date: 11 }
  ];
  const hours = ['上午 7时', '上午 8时', '上午 9时', '上午 10时', '上午 11时', '正午', '下午 1时', '下午 2时', '下午 3时', '下午 4时', '下午 5时', '下午 6时', '下午 7时', '下午 8时', '下午 9时'];
  return (
    <section className="week-panel glass">
      <div className="week-grid">
        <div className="week-corner">GMT+8</div>
        {days.map((day, index) => (
          <div className={`week-date ${day.date === 8 ? 'today' : ''}`} key={day.date}>
            <strong>{day.label}</strong>
            <span>{day.date}</span>
          </div>
        ))}
        {hours.flatMap((hour) =>
          [
            <div className="week-time" key={hour}>{hour}</div>,
            ...days.map((day, index) => (
              <div className="week-slot" key={`${hour}-${day.date}`} data-today={index === 3 ? 'true' : undefined} />
            ))
          ]
        )}
        <div className="week-now-line" />
        <div className="week-event p0 event-a">原型</div>
        <div className="week-event p1 event-b">复盘</div>
        <div className="week-event p2 event-c">阅读</div>
      </div>
    </section>
  );
}

function MonthCalendar() {
  const cells = [
    { date: 28, inactive: true },
    { date: 29, inactive: true },
    { date: 30, inactive: true },
    ...Array.from({ length: 31 }, (_, index) => ({ date: index + 1, inactive: false })),
    { date: 1, inactive: true }
  ];
  return (
    <section className="month-panel glass">
      {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
        <strong className="month-weekday" key={day}>{day}</strong>
      ))}
      {cells.map((cell, index) => {
        const date = cell.date;
        return (
          <div className={`month-cell ${date === 8 && !cell.inactive ? 'today' : ''} ${cell.inactive ? 'inactive' : ''}`} key={`${date}-${index}`}>
            <span>{date}</span>
            {!cell.inactive && [7, 8, 11, 16, 22].includes(date) && <small>任务</small>}
            {!cell.inactive && [8, 16].includes(date) && <small className="blue">重点</small>}
          </div>
        );
      })}
    </section>
  );
}

function FocusScreen({
  mode,
  setMode,
  isFocusing,
  setIsFocusing,
  isPaused,
  setIsPaused,
  setShowReflection,
  todos,
  focusTodoId,
  setFocusTodoId,
  openTodoSheet
}: {
  mode: 'down' | 'up';
  setMode: (value: 'down' | 'up') => void;
  isFocusing: boolean;
  setIsFocusing: (value: boolean) => void;
  isPaused: boolean;
  setIsPaused: (value: boolean) => void;
  setShowReflection: (value: boolean) => void;
  todos: Todo[];
  focusTodoId: number | null;
  setFocusTodoId: (id: number | null) => void;
  openTodoSheet: () => void;
}) {
  const [focusDuration, setFocusDuration] = useState<25 | 40 | 60>(40);
  const [showTaskPicker, setShowTaskPicker] = useState(false);
  const [displaySeconds, setDisplaySeconds] = useState(focusDuration * 60);
  const [timerAnchorAt, setTimerAnchorAt] = useState<number | null>(null);
  const [timerAnchorSeconds, setTimerAnchorSeconds] = useState(focusDuration * 60);
  const selectedTodo = focusTodoId === null ? undefined : todos.find((todo) => todo.id === focusTodoId);
  const timerText = formatTimer(displaySeconds);

  useEffect(() => {
    if (!isFocusing && mode === 'down') {
      setDisplaySeconds(focusDuration * 60);
      setTimerAnchorSeconds(focusDuration * 60);
    }
    if (!isFocusing && mode === 'up') {
      setDisplaySeconds(0);
      setTimerAnchorSeconds(0);
    }
  }, [focusDuration, isFocusing, mode]);

  useEffect(() => {
    if (!isFocusing || isPaused || timerAnchorAt === null) return undefined;

    const timerId = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - timerAnchorAt) / 1000);
      if (mode === 'down') {
        const nextSeconds = Math.max(0, timerAnchorSeconds - elapsed);
        setDisplaySeconds(nextSeconds);
        if (nextSeconds <= 0) {
          window.clearInterval(timerId);
          setTimerAnchorAt(null);
          setTimerAnchorSeconds(0);
          setIsFocusing(false);
          setIsPaused(false);
          setShowReflection(true);
        }
      } else {
        setDisplaySeconds(timerAnchorSeconds + elapsed);
      }
    }, 250);

    return () => window.clearInterval(timerId);
  }, [isFocusing, isPaused, mode, setIsFocusing, setIsPaused, setShowReflection, timerAnchorAt, timerAnchorSeconds]);

  const startFocus = () => {
    const initialSeconds = mode === 'down' ? focusDuration * 60 : 0;
    setDisplaySeconds(initialSeconds);
    setTimerAnchorSeconds(initialSeconds);
    setTimerAnchorAt(Date.now());
    setIsFocusing(true);
    setIsPaused(false);
  };

  const togglePause = () => {
    if (isPaused) {
      setTimerAnchorSeconds(displaySeconds);
      setTimerAnchorAt(Date.now());
      setIsPaused(false);
      return;
    }
    setTimerAnchorSeconds(displaySeconds);
    setTimerAnchorAt(null);
    setIsPaused(true);
  };

  const finishFocus = () => {
    setTimerAnchorAt(null);
    setTimerAnchorSeconds(mode === 'down' ? focusDuration * 60 : 0);
    if (mode === 'down') {
      setDisplaySeconds(focusDuration * 60);
    } else {
      setDisplaySeconds(0);
    }
    setIsFocusing(false);
    setIsPaused(false);
    setShowReflection(true);
  };

  return (
    <div className="page focus-page">
      <header className="hero-row compact">
        <div>
          <p className="date-label">深度推进</p>
          <h1>专注</h1>
        </div>
      </header>

      <div className="segmented glass">
        <button className={mode === 'down' ? 'selected' : ''} disabled={isFocusing} onClick={() => setMode('down')}>
          倒计时
        </button>
        <button className={mode === 'up' ? 'selected' : ''} disabled={isFocusing} onClick={() => setMode('up')}>
          正计时
        </button>
      </div>

      <section className="timer-orb glass-strong">
        <div className="focus-linked-label">
          {selectedTodo ? `关联任务：${selectedTodo.title}` : '未关联任务'}
        </div>
        <div className="timer-ring">
          <span>{timerText}</span>
          {isFocusing && <small>{isPaused ? '已暂停' : '正在专注'}</small>}
        </div>
        {mode === 'down' && (
          <div className={`duration-options ${isFocusing ? 'locked' : ''}`}>
            {[25, 40, 60].map((minutes) => (
              <button
                className={focusDuration === minutes ? 'selected' : ''}
                key={minutes}
                disabled={isFocusing}
                onClick={() => setFocusDuration(minutes as 25 | 40 | 60)}
              >
                {isFocusing && focusDuration !== minutes ? '' : `${minutes}min`}
              </button>
            ))}
          </div>
        )}
        <div className="focus-association">
          {selectedTodo ? (
            <button className="linked-task" onClick={() => setShowTaskPicker(true)}>
              <Timer size={20} />
              <div>
                <strong>{selectedTodo.title}</strong>
                <p>{selectedTodo.priority} · {selectedTodo.due} 截止</p>
              </div>
              <ChevronRight size={18} />
            </button>
          ) : (
            <button className="associate-task-button" onClick={() => setShowTaskPicker(true)}>
              <ListChecks size={18} />
              关联任务
            </button>
          )}
        </div>
      </section>

      <div className="focus-actions">
        {!isFocusing ? (
          <button
            className="primary-button wide"
            onClick={startFocus}
          >
            <Play size={19} />
            开始专注
          </button>
        ) : (
          <>
            <button className="secondary-button glass" onClick={togglePause}>
              {isPaused ? <Play size={19} /> : <Pause size={19} />}
              {isPaused ? '继续' : '暂停'}
            </button>
            <button
              className="primary-button"
              onClick={finishFocus}
            >
              <CheckCircle2 size={19} />
              完成
            </button>
          </>
        )}
      </div>

      {showTaskPicker && (
        <div className="sheet-backdrop" onClick={() => setShowTaskPicker(false)}>
          <section className="sheet floating-card task-picker-sheet glass-strong" onClick={(event) => event.stopPropagation()}>
            <div className="sheet-title-row">
              <div>
                <p className="eyebrow">关联任务</p>
                <h2>选择这次专注的任务</h2>
              </div>
              <Timer size={28} color="#007AFF" />
            </div>
            <div className="focus-choice-list">
              {todos.slice(0, 5).map((todo) => (
                <button
                  className={todo.id === selectedTodo?.id ? 'selected' : ''}
                  key={todo.id}
                  onClick={() => {
                    setFocusTodoId(todo.id);
                    setShowTaskPicker(false);
                  }}
                >
                  <span className={`priority-dot ${todo.priority.toLowerCase()}`} />
                  <span>{todo.title}</span>
                  <small>{todo.progress}%</small>
                </button>
              ))}
              {todos.length === 0 && <p className="empty-note">今天还没有要做的任务。</p>}
            </div>
            <div className="task-picker-actions">
              <button
                className="secondary-button glass"
                onClick={() => {
                  setShowTaskPicker(false);
                  openTodoSheet();
                }}
              >
                <Plus size={17} />
                新增任务
              </button>
              <button
                className="secondary-button glass"
                onClick={() => {
                  setFocusTodoId(null);
                  setShowTaskPicker(false);
                }}
              >
                <Circle size={17} />
                不关联任务
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function AnalyticsScreen() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const analytics = {
    day: {
      label: '今日',
      eyebrow: '今日计划兑现率',
      headline: '64%',
      trend: '待推进',
      bars: [22, 42, 36, 64, 48, 58, 64],
      metrics: [
        { label: '今日完成', value: '3/7', color: 'blue' },
        { label: 'P0 完成率', value: '50%', color: 'red' },
        { label: '专注时长', value: '48m', color: 'green' }
      ],
      insight: '今天的关键风险是 P0 任务进度偏低，建议先选择一个任务进入专注，把第一段 25 分钟留给最临近截止的任务。'
    },
    week: {
      label: '本周',
      eyebrow: '本周计划兑现率',
      headline: '78%',
      trend: '+12%',
      bars: [42, 66, 58, 74, 52, 88, 78],
      metrics: [
        { label: 'P0 完成率', value: '66%', color: 'red' },
        { label: '连续完成', value: '6天', color: 'green' },
        { label: '专注时长', value: '7.5h', color: 'blue' }
      ],
      insight: '本周整体兑现率上升，但低进度临期任务偏多。建议把明天 P0 控制在 3 件以内，并提前给复杂任务拆步骤。'
    },
    month: {
      label: '本月',
      eyebrow: '本月完成稳定性',
      headline: '82%',
      trend: '+8%',
      bars: [56, 48, 72, 62, 84, 68, 82],
      metrics: [
        { label: '完成事项', value: '46', color: 'blue' },
        { label: '高峰日', value: '周三', color: 'purple' },
        { label: '延期率', value: '14%', color: 'red' }
      ],
      insight: '本月完成情况比较稳定，工作类任务占用较多连续时间。建议每周预留半天做低优先级清理，避免月底堆积。'
    }
  }[period];

  return (
    <div className="page">
      <header className="hero-row compact">
        <div>
          <p className="date-label">{analytics.label}复盘</p>
          <h1>分析</h1>
        </div>
        <Activity size={26} color="#007AFF" />
      </header>

      <div className="segmented glass three">
        <button className={period === 'day' ? 'selected' : ''} onClick={() => setPeriod('day')}>
          日
        </button>
        <button className={period === 'week' ? 'selected' : ''} onClick={() => setPeriod('week')}>
          周
        </button>
        <button className={period === 'month' ? 'selected' : ''} onClick={() => setPeriod('month')}>
          月
        </button>
      </div>

      <section className="chart-panel glass-strong">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{analytics.eyebrow}</p>
            <h2>{analytics.headline}</h2>
          </div>
          <span className="trend">{analytics.trend}</span>
        </div>
        <div className="bars">
          {analytics.bars.map((height, index) => (
            <i key={index} style={{ height: `${height}%` }} />
          ))}
          <svg viewBox="0 0 260 90" preserveAspectRatio="none">
            <path d="M0 64 C42 44 58 60 90 36 C122 12 152 52 184 32 C212 16 228 30 260 18" />
          </svg>
        </div>
      </section>

      <div className="metric-grid">
        {analytics.metrics.map((metric) => (
          <Metric key={metric.label} label={metric.label} value={metric.value} color={metric.color} />
        ))}
      </div>

      <section className="insight-panel glass">
        <h3>{analytics.label}建议</h3>
        <p>{analytics.insight}</p>
      </section>
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <section className={`metric glass ${color}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </section>
  );
}

function ProfileScreen({ nickname, reflections }: { nickname: string; reflections: string[] }) {
  return (
    <div className="page">
      <header className="profile-head glass-strong">
        <div className="avatar">
          <UserRound size={30} />
        </div>
        <div>
          <h1>{nickname || '朋友'}</h1>
          <p>本地模式 · 未开启云同步</p>
        </div>
      </header>

      <section className="reflection glass">
        <p className="eyebrow">专注感想</p>
        <h3>{reflections.length ? '最近记录' : '还没有记录'}</h3>
        <p>{reflections[0] ?? '完成一次专注后，感想会沉淀在这里。'}</p>
      </section>

      <section className="premium glass">
        <div>
          <p className="eyebrow">会员中心</p>
          <h2>解锁云同步与高级分析</h2>
        </div>
        <Sparkles size={24} color="#AF52DE" />
      </section>

      <SettingsGroup
        items={[
          ['数据同步', '最近备份：未开启', <Cloud size={19} />],
          ['通知设置', '计划、截止、习惯提醒', <Bell size={19} />],
          ['AI 授权', '拆分步骤与分析建议', <Wand2 size={19} />]
        ]}
      />
      <SettingsGroup
        items={[
          ['默认优先级', 'P1', <Layers3 size={19} />],
          ['隐私与数据', '导出、删除、权限', <LockKeyhole size={19} />],
          ['完成箱', '已完成 12 件', <Inbox size={19} />]
        ]}
      />
    </div>
  );
}

function SettingsGroup({ items }: { items: [string, string, ReactNode][] }) {
  return (
    <section className="settings-group glass">
      {items.map(([title, detail, icon]) => (
        <button className="setting-row" key={title}>
          <span className="setting-icon">{icon}</span>
          <span>
            <strong>{title}</strong>
            <small>{detail}</small>
          </span>
          <ChevronRight size={17} />
        </button>
      ))}
    </section>
  );
}

function TabBar({
  activeTab,
  setActiveTab,
  nickname
}: {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  nickname: string;
}) {
  const tabs: { id: Tab; label: string; icon: ReactNode }[] = [
    { id: 'home', label: '首页', icon: <ListChecks size={21} /> },
    { id: 'calendar', label: '日历', icon: <CalendarDays size={21} /> },
    { id: 'focus', label: '专注', icon: <Clock3 size={21} /> },
    { id: 'analytics', label: '分析', icon: <BarChart3 size={21} /> },
    { id: 'profile', label: nickname || '我的', icon: <UserRound size={21} /> }
  ];

  return (
    <nav className="tabbar glass">
      {tabs.map((tab) => (
        <button className={activeTab === tab.id ? 'active' : ''} key={tab.id} onClick={() => setActiveTab(tab.id)}>
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default App;
