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
  Sparkles,
  Timer,
  UserRound,
  Wand2
} from 'lucide-react';
import { ReactNode, useMemo, useState } from 'react';

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

function formatTodoDue(value: string) {
  if (!value) return '今天';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '今天';
  return `${date.getMonth() + 1}月${date.getDate()}日 ${formatTime(value)}`;
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
  const [reflections, setReflections] = useState<string[]>([]);
  const [showTodoSheet, setShowTodoSheet] = useState(false);
  const [todoTitle, setTodoTitle] = useState('');
  const [todoPriority, setTodoPriority] = useState<Priority>('P1');
  const [todoType, setTodoType] = useState<TodoType>('工作');
  const [todoNote, setTodoNote] = useState('');
  const [todoStart, setTodoStart] = useState('');
  const [todoEnd, setTodoEnd] = useState('');
  const [todoRecurring, setTodoRecurring] = useState(false);
  const [todoRecurrenceRule, setTodoRecurrenceRule] = useState('每天');
  const [todoStepDraft, setTodoStepDraft] = useState('');
  const [todoSteps, setTodoSteps] = useState<string[]>([]);
  const [showAssociateSheet, setShowAssociateSheet] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [nickname, setNickname] = useState(() => window.localStorage.getItem('schedule-todo-nickname') ?? '');
  const [nicknameDraft, setNicknameDraft] = useState(nickname);

  const todayFocus = todos.filter((todo) => todo.isTodayFocus && todo.progress < 100);
  const activeTodos = todos.filter((todo) => todo.progress < 100);
  const completedCount = todos.filter((todo) => todo.progress === 100).length;

  const groupedTodos = useMemo(() => {
    const keyList = groupBy === 'priority' ? ['P0', 'P1', 'P2'] : ['工作', '日常', '学习', '健康'];
    return keyList.map((key) => ({
      key,
      items: activeTodos.filter((todo) => (groupBy === 'priority' ? todo.priority === key : todo.type === key))
    }));
  }, [activeTodos, groupBy]);

  const completeTodo = (id: number) => {
    setTodos((current) => current.map((todo) => (todo.id === id ? { ...todo, progress: 100 } : todo)));
  };

  const bumpProgress = (id: number) => {
    setTodos((current) =>
      current.map((todo) => (todo.id === id ? { ...todo, progress: Math.min(100, todo.progress + 25) } : todo))
    );
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
        due: todoEnd ? formatTodoDue(todoEnd) : '今天',
        time: todoStart && todoEnd ? `${formatTime(todoStart)}-${formatTime(todoEnd)}` : undefined,
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
    setTodoStart('');
    setTodoEnd('');
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
    const base = todoTitle.trim() || '这个待办';
    setTodoSteps([
      `明确「${base}」的完成标准`,
      '拆出最小可执行动作',
      '安排第一段推进时间'
    ]);
  };

  const associateTodayFocus = (id: number) => {
    setTodos((current) => current.map((todo) => (todo.id === id ? { ...todo, isTodayFocus: true } : todo)));
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
    setReflectionDraft('');
    setShowReflection(false);
    setIsFocusing(false);
    setIsPaused(false);
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
              addFocusTodo={addFocusTodo}
              completedCount={completedCount}
              nickname={nickname}
              openTodoSheet={() => setShowTodoSheet(true)}
              openAssociateSheet={() => setShowAssociateSheet(true)}
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
            <textarea
              value={reflectionDraft}
              onChange={(event) => setReflectionDraft(event.target.value)}
              placeholder="这次专注有什么收获、阻碍或想法？"
            />
            <button className="primary-button" onClick={saveReflection}>
              保存感想
            </button>
          </section>
        </div>
      )}

      {showTodoSheet && (
        <div className="sheet-backdrop" onClick={() => setShowTodoSheet(false)}>
          <section className="sheet glass-strong" onClick={(event) => event.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-title-row">
              <div>
                <p className="eyebrow">新待办</p>
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
            <div className="form-row">
              <label>
                计划开始
                <input
                  className="text-input compact-input"
                  type="datetime-local"
                  value={todoStart}
                  onChange={(event) => setTodoStart(event.target.value)}
                />
              </label>
              <label>
                计划截止
                <input
                  className="text-input compact-input"
                  type="datetime-local"
                  value={todoEnd}
                  onChange={(event) => setTodoEnd(event.target.value)}
                />
              </label>
            </div>
            <label className="toggle-row">
              <span>
                <strong>是否循环</strong>
                <small>开启后视为习惯</small>
              </span>
              <input
                type="checkbox"
                checked={todoRecurring}
                onChange={(event) => setTodoRecurring(event.target.checked)}
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
                <button className="small-action purple" onClick={splitStepsWithAI}>
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
                <button className="small-action" onClick={addManualStep}>
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
              创建待办
            </button>
          </section>
        </div>
      )}
      {showAssociateSheet && (
        <div className="sheet-backdrop" onClick={() => setShowAssociateSheet(false)}>
          <section className="sheet glass-strong" onClick={(event) => event.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-title-row">
              <div>
                <p className="eyebrow">今日重点</p>
                <h2>关联已有待办</h2>
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
                <p className="empty-note">没有可关联的未完成待办</p>
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
  addFocusTodo,
  completedCount,
  nickname,
  openTodoSheet,
  openAssociateSheet
}: {
  todos: Todo[];
  todayFocus: Todo[];
  groupedTodos: { key: string; items: Todo[] }[];
  groupBy: 'priority' | 'type';
  setGroupBy: (value: 'priority' | 'type') => void;
  completeTodo: (id: number) => void;
  bumpProgress: (id: number) => void;
  addFocusTodo: () => void;
  completedCount: number;
  nickname: string;
  openTodoSheet: () => void;
  openAssociateSheet: () => void;
}) {
  return (
    <div className="page">
      <header className="hero-row">
        <div>
          <p className="date-label">7月7日 周二</p>
          <h1>你好 {nickname || '朋友'}</h1>
          <p className="summary">还有 {todayFocus.length + 2} 件事，其中 1 件 P0 需要推进</p>
        </div>
        <button className="icon-button glass" aria-label="创建待办" onClick={openTodoSheet}>
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
          {todayFocus.slice(0, 3).map((todo) => (
            <button className="focus-item" key={todo.id} onClick={() => bumpProgress(todo.id)}>
              <span className={`priority-dot ${todo.priority.toLowerCase()}`} />
              <span>{todo.title}</span>
              <span className="muted">{todo.time ?? '未安排时间'}</span>
            </button>
          ))}
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
                <TodoRow key={todo.id} todo={todo} completeTodo={completeTodo} bumpProgress={bumpProgress} />
              ))}
            </section>
          ) : null
        )}
      </div>

      <button className="complete-box glass">
        <Inbox size={18} />
        完成箱
        <span>{completedCount}</span>
      </button>
    </div>
  );
}

function TodoRow({
  todo,
  completeTodo,
  bumpProgress
}: {
  todo: Todo;
  completeTodo: (id: number) => void;
  bumpProgress: (id: number) => void;
}) {
  const atRisk = todo.priority === 'P0' && todo.progress < 50;
  return (
    <div className={`todo-row ${atRisk ? 'risk' : ''}`}>
      <button className="check-button" onClick={() => completeTodo(todo.id)} aria-label="完成待办">
        <Circle size={22} />
      </button>
      <div className="todo-main">
        <div className="todo-title-line">
          <strong>{todo.title}</strong>
          <span className={`priority-badge ${todo.priority.toLowerCase()}`}>{todo.priority}</span>
        </div>
        <p>{todo.note ?? `${todo.type} · ${todo.due}`}</p>
      </div>
      <button className="progress-ring" onClick={() => bumpProgress(todo.id)} aria-label="更新进度">
        <svg viewBox="0 0 36 36">
          <path className="ring-bg" d="M18 2.8a15.2 15.2 0 1 1 0 30.4a15.2 15.2 0 0 1 0-30.4" />
          <path
            className="ring-fg"
            strokeDasharray={`${todo.progress}, 100`}
            d="M18 2.8a15.2 15.2 0 1 1 0 30.4a15.2 15.2 0 0 1 0-30.4"
          />
        </svg>
        <span>{todo.progress}</span>
      </button>
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
  return (
    <div className="page">
      <header className="hero-row compact">
        <div>
          <p className="date-label">2026年7月</p>
          <h1>日历</h1>
        </div>
        <button className="icon-button glass" aria-label="新增日程">
          <Plus size={22} />
        </button>
      </header>

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
  const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
  return (
    <section className="calendar-panel glass">
      {hours.map((time) => (
        <div className="time-line" key={time}>
          <span>{time}</span>
          <i />
        </div>
      ))}
      {calendarBlocks.map((block) => (
        <div
          className={`calendar-block ${block.priority.toLowerCase()}`}
          key={block.id}
          style={{
            top: `${(parseInt(block.start) - 8) * 72 + (block.start.includes(':20') ? 24 : 0) + 18}px`,
            left: `calc(58px + ${block.column * (100 / block.columns)}%)`,
            width: `calc((100% - 70px) / ${block.columns} - 6px)`
          }}
        >
          <strong>{block.title}</strong>
          <span>
            {block.start}-{block.end}
          </span>
        </div>
      ))}
    </section>
  );
}

function WeekCalendar() {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  return (
    <section className="week-panel glass">
      <div className="week-grid">
        <div className="week-corner">GMT+8</div>
        {days.map((day, index) => (
          <div className={`week-date ${index === 1 ? 'today' : ''}`} key={day}>
            <strong>{day}</strong>
            <span>{6 + index}</span>
          </div>
        ))}
        {hours.flatMap((hour) =>
          [
            <div className="week-time" key={hour}>{hour}</div>,
            ...days.map((day, index) => (
              <div className="week-slot" key={`${hour}-${day}`} data-today={index === 1 ? 'true' : undefined} />
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
  return (
    <section className="month-panel glass">
      {Array.from({ length: 35 }, (_, index) => {
        const date = index + 1;
        return (
          <div className={`month-cell ${date === 7 ? 'today' : ''}`} key={date}>
            <span>{date}</span>
            {[7, 8, 11, 16, 22].includes(date) && <small>待办</small>}
            {[7, 16].includes(date) && <small className="blue">重点</small>}
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
  setShowReflection
}: {
  mode: 'down' | 'up';
  setMode: (value: 'down' | 'up') => void;
  isFocusing: boolean;
  setIsFocusing: (value: boolean) => void;
  isPaused: boolean;
  setIsPaused: (value: boolean) => void;
  setShowReflection: (value: boolean) => void;
}) {
  return (
    <div className="page focus-page">
      <header className="hero-row compact">
        <div>
          <p className="date-label">深度推进</p>
          <h1>专注</h1>
        </div>
      </header>

      <div className="segmented glass">
        <button className={mode === 'down' ? 'selected' : ''} onClick={() => setMode('down')}>
          倒计时
        </button>
        <button className={mode === 'up' ? 'selected' : ''} onClick={() => setMode('up')}>
          正计时
        </button>
      </div>

      <section className="timer-orb glass-strong">
        <div className="timer-ring">
          <span>{mode === 'down' ? '24:32' : '08:18'}</span>
          <small>{isFocusing ? (isPaused ? '已暂停' : '正在专注') : '关联：产品原型第一版'}</small>
        </div>
      </section>

      <section className="linked-task glass">
        <Timer size={20} />
        <div>
          <strong>产品原型第一版</strong>
          <p>P0 · 今天 18:00 截止</p>
        </div>
        <ChevronRight size={18} />
      </section>

      <div className="focus-actions">
        {!isFocusing ? (
          <button
            className="primary-button wide"
            onClick={() => {
              setIsFocusing(true);
              setIsPaused(false);
            }}
          >
            <Play size={19} />
            开始专注
          </button>
        ) : (
          <>
            <button className="secondary-button glass" onClick={() => setIsPaused(!isPaused)}>
              {isPaused ? <Play size={19} /> : <Pause size={19} />}
              {isPaused ? '继续' : '暂停'}
            </button>
            <button className="primary-button" onClick={() => setShowReflection(true)}>
              <CheckCircle2 size={19} />
              完成
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function AnalyticsScreen() {
  return (
    <div className="page">
      <header className="hero-row compact">
        <div>
          <p className="date-label">过去 7 天</p>
          <h1>分析</h1>
        </div>
        <Activity size={26} color="#007AFF" />
      </header>

      <section className="chart-panel glass-strong">
        <div className="section-heading">
          <div>
            <p className="eyebrow">计划兑现率</p>
            <h2>78%</h2>
          </div>
          <span className="trend">+12%</span>
        </div>
        <div className="bars">
          {[42, 66, 58, 74, 52, 88, 78].map((height, index) => (
            <i key={index} style={{ height: `${height}%` }} />
          ))}
          <svg viewBox="0 0 260 90" preserveAspectRatio="none">
            <path d="M0 64 C42 44 58 60 90 36 C122 12 152 52 184 32 C212 16 228 30 260 18" />
          </svg>
        </div>
      </section>

      <div className="metric-grid">
        <Metric label="P0 完成率" value="66%" color="red" />
        <Metric label="连续完成" value="6天" color="green" />
        <Metric label="专注时长" value="7.5h" color="blue" />
      </div>

      <section className="insight-panel glass">
        <h3>建议</h3>
        <p>明天 P0 控制在 3 件以内。当前低进度临期任务偏多，建议先给「产品原型第一版」安排一段完整专注时间。</p>
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
