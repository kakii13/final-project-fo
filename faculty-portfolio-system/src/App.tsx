import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import './App.css'

type Role = 'admin' | 'faculty'
type Status = 'Submitted' | 'Pending' | 'Incomplete'
type Faculty = {
  id: string
  name: string
  email: string
  rank: string
  department: string
  password: string
}
type PortfolioFile = {
  facultyId: string
  category: string
  fileName: string
  dataUrl: string
  updatedAt: string
}
type UserSession = { role: Role; facultyId?: string; name: string }

const categories = [
  'Personal Data Sheet', 'Syllabi', 'Class Records', 'Grading Sheets',
  'Accomplishment Reports', 'Exams (Midterm and Final)', 'Quizzes and Tests',
  'Table of Specifications', 'Rubrics', 'Sample Student Projects',
  'Instructional Materials', 'PRC License', 'Trainings and Seminars',
  'Research Projects', 'Extension Projects', 'Documentation',
  'Membership in Organization',
]
const ranks = ['Instructor I', 'Instructor II', 'Instructor III', 'Assistant Professor I', 'Assistant Professor II', 'Associate Professor I', 'Professor I']
const departments = ['Arts and Sciences', 'Education', 'Engineering and Technology', 'Business and Management']
const seedFaculty: Faculty[] = [
  { id: 'f-101', name: 'Maria Lourdes Reyes', email: 'm.reyes@sorsu.edu.ph', rank: 'Associate Professor I', department: 'Education', password: 'faculty123' },
  { id: 'f-102', name: 'Juan Carlo Dela Cruz', email: 'jc.delacruz@sorsu.edu.ph', rank: 'Assistant Professor II', department: 'Engineering and Technology', password: 'faculty123' },
  { id: 'f-103', name: 'Ana Patricia Mendoza', email: 'a.mendoza@sorsu.edu.ph', rank: 'Instructor III', department: 'Arts and Sciences', password: 'faculty123' },
  { id: 'f-104', name: 'Ramon Garcia', email: 'r.garcia@sorsu.edu.ph', rank: 'Instructor II', department: 'Business and Management', password: 'faculty123' },
]
const seedFiles: PortfolioFile[] = categories.slice(0, 9).map((category, index) => ({
  facultyId: seedFaculty[index % seedFaculty.length].id,
  category,
  fileName: `${category.toLowerCase().replaceAll(' ', '-')}.pdf`,
  dataUrl: '',
  updatedAt: new Date(Date.now() - index * 86400000).toISOString(),
}))
const storeKeys = { faculty: 'sorsu.faculty.v1', files: 'sorsu.portfolios.v1' }

function readStore<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) as T : fallback
  } catch (error) {
    console.error(`Unable to load saved data from "${key}".`, error)
    return fallback
  }
}
function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    folder: <><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M3 11h18" /></>,
    chart: <><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-5 5" /></>,
    report: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h8" /></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5M12 15V3" /></>,
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5M12 3v12" /></>,
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
    trash: <><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] ?? paths.folder}</svg>
}

function App() {
  const [faculty, setFaculty] = useState<Faculty[]>(() => readStore(storeKeys.faculty, seedFaculty))
  const [files, setFiles] = useState<PortfolioFile[]>(() => readStore(storeKeys.files, seedFiles))
  const [session, setSession] = useState<UserSession | null>(() => {
    try { return JSON.parse(sessionStorage.getItem('sorsu.session') ?? localStorage.getItem('sorsu.session') ?? 'null') as UserSession | null } catch { return null }
  })
  const [page, setPage] = useState('Dashboard')
  const [search, setSearch] = useState('')
  const [selectedFaculty, setSelectedFaculty] = useState('')
  const [modal, setModal] = useState<'faculty' | 'profile' | null>(null)
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null)
  const [toast, setToast] = useState('')
  const [mobileNav, setMobileNav] = useState(false)

  const persistFaculty = (next: Faculty[]) => {
    try { localStorage.setItem(storeKeys.faculty, JSON.stringify(next)); setFaculty(next) }
    catch (error) { console.error('Unable to save faculty data.', error); notify('Could not save faculty data. Check available browser storage.') }
  }
  const persistFiles = (next: PortfolioFile[]) => {
    try { localStorage.setItem(storeKeys.files, JSON.stringify(next)); setFiles(next) }
    catch (error) { console.error('Unable to save portfolio documents.', error); notify('Could not save this document. Browser storage may be full.') }
  }
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 3000) }
  const isAdmin = session?.role === 'admin'
  const currentFaculty = faculty.find((item) => item.id === session?.facultyId)
  const ownedFaculty = isAdmin ? faculty : faculty.filter((item) => item.id === session?.facultyId)
  const visibleFiles = files.filter((file) => ownedFaculty.some((item) => item.id === file.facultyId))
  const completion = (facultyId: string) => Math.round((files.filter((file) => file.facultyId === facultyId).length / categories.length) * 100)
  const statusOf = (facultyId: string): Status => {
    const count = files.filter((file) => file.facultyId === facultyId).length
    return count === 0 ? 'Pending' : count >= categories.length ? 'Submitted' : 'Incomplete'
  }
  const pageFaculty = useMemo(() => ownedFaculty.filter((item) => `${item.name} ${item.email} ${item.department} ${item.rank}`.toLowerCase().includes(search.toLowerCase())), [ownedFaculty, search])

  const login = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email')).trim().toLowerCase()
    const password = String(form.get('password'))
    const role = String(form.get('role')) as Role
    if (role === 'admin' && email === 'admin@sorsu.edu.ph' && password === 'admin123') {
      saveSession({ role: 'admin', name: 'System Administrator' }, Boolean(form.get('remember')))
      return
    }
    const account = faculty.find((item) => item.email.toLowerCase() === email && item.password === password)
    if (role === 'faculty' && account) {
      saveSession({ role: 'faculty', facultyId: account.id, name: account.name }, Boolean(form.get('remember')))
      return
    }
    notify('Email, password, or account role is incorrect.')
  }
  const saveSession = (user: UserSession, remember: boolean) => {
    sessionStorage.removeItem('sorsu.session')
    localStorage.removeItem('sorsu.session')
    ;(remember ? localStorage : sessionStorage).setItem('sorsu.session', JSON.stringify(user))
    setSession(user)
    setPage('Dashboard')
  }
  const logout = () => {
    sessionStorage.removeItem('sorsu.session')
    localStorage.removeItem('sorsu.session')
    setSession(null)
    setPage('Dashboard')
  }
  const addRegistration = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const email = String(data.get('email')).trim().toLowerCase()
    if (faculty.some((item) => item.email.toLowerCase() === email)) { notify('An account with this email already exists.'); return }
    const account: Faculty = {
      id: crypto.randomUUID(), name: String(data.get('name')).trim(), email,
      rank: String(data.get('rank')), department: String(data.get('department')),
      password: String(data.get('password')),
    }
    persistFaculty([...faculty, account])
    saveSession({ role: 'faculty', facultyId: account.id, name: account.name }, true)
    notify('Your faculty account has been created.')
  }
  const saveFaculty = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const email = String(data.get('email')).trim().toLowerCase()
    if (faculty.some((item) => item.email.toLowerCase() === email && item.id !== editingFaculty?.id)) { notify('That email is already in use.'); return }
    if (editingFaculty) {
      persistFaculty(faculty.map((item) => item.id === editingFaculty.id ? { ...item, name: String(data.get('name')).trim(), email, rank: String(data.get('rank')), department: String(data.get('department')) } : item))
      notify('Faculty record updated.')
    } else {
      persistFaculty([...faculty, { id: crypto.randomUUID(), name: String(data.get('name')).trim(), email, rank: String(data.get('rank')), department: String(data.get('department')), password: 'faculty123' }])
      notify('Faculty member added. Temporary password: faculty123')
    }
    setModal(null)
    setEditingFaculty(null)
  }
  const deleteFaculty = (person: Faculty) => {
    if (!window.confirm(`Delete ${person.name} and all their portfolio documents? This cannot be undone.`)) return
    persistFaculty(faculty.filter((item) => item.id !== person.id))
    persistFiles(files.filter((file) => file.facultyId !== person.id))
    notify('Faculty record deleted.')
  }
  const uploadFile = (facultyId: string, category: string, input: HTMLInputElement) => {
    const file = input.files?.[0]
    if (!file) return
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png']
    if (!allowed.includes(file.type)) { notify('Use a PDF, Word, Excel, JPG, or PNG file.'); input.value = ''; return }
    if (file.size > 3 * 1024 * 1024) { notify('Files must be 3 MB or smaller.'); input.value = ''; return }
    const reader = new FileReader()
    reader.onload = () => {
      const next: PortfolioFile = { facultyId, category, fileName: file.name, dataUrl: String(reader.result), updatedAt: new Date().toISOString() }
      persistFiles([...files.filter((item) => item.facultyId !== facultyId || item.category !== category), next])
      notify(`${category} uploaded successfully.`)
    }
    reader.onerror = () => notify('The selected file could not be read.')
    reader.readAsDataURL(file)
    input.value = ''
  }
  const removeFile = (file: PortfolioFile) => {
    if (!window.confirm(`Remove ${file.category} document "${file.fileName}"?`)) return
    persistFiles(files.filter((item) => item.facultyId !== file.facultyId || item.category !== file.category))
    notify('Portfolio document removed.')
  }

  if (!session) return <LoginScreen onLogin={login} onRegister={addRegistration} notify={notify} toast={toast} />

  const navigation = isAdmin
    ? [['Dashboard', 'grid'], ['Manage Faculty', 'users'], ['Faculty Portfolios', 'folder'], ['Analytics Dashboard', 'chart'], ['Reports', 'report']]
    : [['Dashboard', 'grid'], ['My Profile', 'users'], ['My Portfolio', 'folder'], ['Analytics', 'chart'], ['Reports', 'report']]
  const title = page === 'Analytics Dashboard' ? 'Analytics' : page
  const navTo = (item: string) => { setPage(item); setSearch(''); setMobileNav(false) }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark">S</div><div><strong>SorSU</strong><span>FACULTY PORTAL</span></div><button className="icon-btn sidebar-close" onClick={() => setMobileNav(false)} aria-label="Close menu"><Icon name="close" /></button></div>
      <div className="campus-label">BULAN CAMPUS</div>
      <div className="nav-label">WORKSPACE</div>
      <nav>{navigation.map(([label, icon]) => <button key={label} className={`nav-item ${page === label ? 'active' : ''}`} onClick={() => navTo(label)}><Icon name={icon} /><span>{label}</span>{label === 'Faculty Portfolios' && <span className="nav-count">{files.length}</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="help-box"><span className="help-icon">?</span><div><b>Need help?</b><span>Contact your campus administrator.</span></div></div><button className="nav-item logout-btn" onClick={logout}><Icon name="logout" /><span>Log out</span></button></div>
      <div className="sidebar-foot">SORSU • BULAN CAMPUS <span>v1.0</span></div>
    </aside>
    {mobileNav && <button className="nav-scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}
    <main className="main-area">
      <header className="topbar"><button className="icon-btn mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open menu"><Icon name="menu" /></button><div className="breadcrumb">Workspace <span>/</span> <b>{title}</b></div><div className="topbar-right"><span className="academic-year"><Icon name="calendar" size={15} /> AY 2025–2026</span><button className="icon-btn notification-btn" aria-label="Notifications" onClick={() => notify('You’re all caught up.')}><Icon name="bell" /><i /></button><div className="top-user"><div className="avatar">{session.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div><div><b>{session.name}</b><span>{isAdmin ? 'Administrator' : currentFaculty?.rank ?? 'Faculty Member'}</span></div></div></div></header>
      <div className="page-content">
        {page === 'Dashboard' && <Dashboard isAdmin={isAdmin} faculty={ownedFaculty} files={visibleFiles} completion={completion} statusOf={statusOf} onNavigate={navTo} onSelectFaculty={setSelectedFaculty} />}
        {page === 'Manage Faculty' && <FacultyPage faculty={pageFaculty} search={search} setSearch={setSearch} onAdd={() => { setEditingFaculty(null); setModal('faculty') }} onEdit={(person) => { setEditingFaculty(person); setModal('faculty') }} onDelete={deleteFaculty} onView={(id) => { setSelectedFaculty(id); setPage('Faculty Portfolios') }} completion={completion} statusOf={statusOf} />}
        {((isAdmin && page === 'Faculty Portfolios') || (!isAdmin && page === 'My Portfolio')) && <PortfolioPage faculty={ownedFaculty} files={visibleFiles} isAdmin={isAdmin} selectedFaculty={selectedFaculty} onSelectFaculty={setSelectedFaculty} onUpload={uploadFile} onRemove={removeFile} onOpenFaculty={(id) => { setSelectedFaculty(id); setPage('Faculty Portfolios') }} />}
        {(page === 'Analytics Dashboard' || page === 'Analytics') && <AnalyticsPage faculty={ownedFaculty} files={visibleFiles} completion={completion} statusOf={statusOf} isAdmin={isAdmin} />}
        {page === 'Reports' && <ReportsPage faculty={ownedFaculty} files={visibleFiles} statusOf={statusOf} />}
        {page === 'My Profile' && currentFaculty && <ProfilePage person={currentFaculty} onEdit={() => { setEditingFaculty(currentFaculty); setModal('profile') }} />}
      </div>
    </main>
    {modal && <Modal title={modal === 'profile' ? 'Edit my profile' : editingFaculty ? 'Edit faculty member' : 'Add faculty member'} onClose={() => { setModal(null); setEditingFaculty(null) }}>
      <FacultyForm person={editingFaculty} onCancel={() => { setModal(null); setEditingFaculty(null) }} onSubmit={modal === 'profile' ? (event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        const updated = { ...currentFaculty!, name: String(data.get('name')).trim(), email: String(data.get('email')).trim().toLowerCase(), rank: String(data.get('rank')), department: String(data.get('department')) }
        if (faculty.some((item) => item.email.toLowerCase() === updated.email && item.id !== updated.id)) { notify('That email is already in use.'); return }
        persistFaculty(faculty.map((item) => item.id === updated.id ? updated : item))
        setSession({ ...session, name: updated.name })
        notify('Profile updated.')
        setModal(null)
      } : saveFaculty} profileOnly={modal === 'profile'} />
    </Modal>}
    {toast && <div className="toast" role="status">{toast}</div>}
  </div>
}

function LoginScreen({ onLogin, onRegister, notify, toast }: { onLogin: (event: FormEvent<HTMLFormElement>) => void; onRegister: (event: FormEvent<HTMLFormElement>) => void; notify: (message: string) => void; toast: string }) {
  const [register, setRegister] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [forgot, setForgot] = useState(false)
  return <div className="auth-page"><div className="auth-brand"><div className="brand-mark">S</div><div><b>Sorsogon State University</b><span>Bulan Campus · Faculty Services</span></div></div><div className="auth-layout"><section className="auth-welcome"><div className="welcome-tag">FACULTY SERVICES PORTAL</div><h1>Your work.<br /><span>Your impact.</span></h1><p>A simpler way to manage your faculty portfolio, track submissions, and celebrate the work you do at SorSU.</p><div className="welcome-stats"><div><b>17</b><span>Portfolio categories</span></div><div><b>One place</b><span>For your faculty records</span></div></div><div className="welcome-decoration" /></section><section className="auth-card">
    <div className="auth-heading"><div className="card-overline">{register ? 'JOIN YOUR CAMPUS' : 'WELCOME BACK'}</div><h2>{register ? 'Create your account' : forgot ? 'Reset your password' : 'Sign in to your account'}</h2><p>{register ? 'Enter your faculty details to get started.' : forgot ? 'Enter your faculty email to request a reset.' : 'Enter your credentials to continue.'}</p></div>
    {forgot ? <form onSubmit={(event) => { event.preventDefault(); notify('If an account exists for this email, contact your administrator to reset your password.'); setForgot(false) }}><label>Faculty email<input type="email" name="email" placeholder="name@sorsu.edu.ph" required /></label><button className="btn btn-primary btn-full" type="submit">Request password reset</button><button type="button" className="text-button centered" onClick={() => setForgot(false)}>Back to sign in</button></form>
      : register ? <form onSubmit={onRegister}><label>Full name<input name="name" placeholder="e.g. Maria Lourdes Reyes" required minLength={3} /></label><label>Faculty email<input type="email" name="email" placeholder="name@sorsu.edu.ph" required /></label><div className="form-grid"><label>Academic rank<select name="rank" defaultValue="" required><option value="" disabled>Select rank</option>{ranks.map((rank) => <option key={rank}>{rank}</option>)}</select></label><label>Department<select name="department" defaultValue="" required><option value="" disabled>Select department</option>{departments.map((dept) => <option key={dept}>{dept}</option>)}</select></label></div><label>Create password<input type="password" name="password" placeholder="At least 8 characters" minLength={8} required /></label><button className="btn btn-primary btn-full" type="submit">Create faculty account <span>→</span></button><button type="button" className="text-button centered" onClick={() => setRegister(false)}>Already have an account? Sign in</button></form>
      : <form onSubmit={onLogin}><label>Sign in as<select name="role"><option value="faculty">Faculty member</option><option value="admin">Administrator</option></select></label><label>Email address<input type="email" name="email" placeholder="name@sorsu.edu.ph" autoComplete="username" required /></label><label>Password<div className="password-wrap"><input type={showPassword ? 'text' : 'password'} name="password" placeholder="Enter your password" autoComplete="current-password" required /><button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button></div></label><div className="form-options"><label className="check-label"><input type="checkbox" name="remember" /> Remember me</label><button className="text-button" type="button" onClick={() => setForgot(true)}>Forgot password?</button></div><button className="btn btn-primary btn-full" type="submit">Sign in <span>→</span></button><div className="auth-divider"><span>NEW TO THE PORTAL?</span></div><button type="button" className="btn btn-outline btn-full" onClick={() => setRegister(true)}>Create a faculty account</button></form>}
    <div className="demo-access"><b>Demo access</b><span>Admin: admin@sorsu.edu.ph / admin123</span><span>Faculty: m.reyes@sorsu.edu.ph / faculty123</span></div>
  </section></div><footer className="auth-footer"><span>© 2025 Sorsogon State University · Bulan Campus</span><span>For faculty use only</span></footer>{toast && <div className="toast">{toast}</div>}</div>
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-heading"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1><p>{description}</p></div>{action && <div className="heading-action">{action}</div>}</div>
}
function StatCard({ label, value, detail, icon, tone, progress }: { label: string; value: string | number; detail: string; icon: string; tone: string; progress?: number }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon name={icon} size={19} /></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-detail">{progress !== undefined ? <div className="mini-progress"><i style={{ width: `${progress}%` }} /></div> : null}{detail}</div></div>
}
function Dashboard({ isAdmin, faculty, files, completion, statusOf, onNavigate, onSelectFaculty }: { isAdmin: boolean; faculty: Faculty[]; files: PortfolioFile[]; completion: (id: string) => number; statusOf: (id: string) => Status; onNavigate: (page: string) => void; onSelectFaculty: (id: string) => void }) {
  const completed = faculty.filter((person) => statusOf(person.id) === 'Submitted').length
  const inProgress = faculty.filter((person) => statusOf(person.id) === 'Incomplete').length
  const pending = faculty.filter((person) => statusOf(person.id) === 'Pending').length
  const avg = faculty.length ? Math.round(faculty.reduce((sum, person) => sum + completion(person.id), 0) / faculty.length) : 0
  const recent = [...files].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5)
  const title = isAdmin ? 'Good morning, Administrator' : `Welcome back, ${faculty[0]?.name.split(' ')[0] ?? 'Faculty'}`
  return <><PageHeading eyebrow={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()} title={title} description={isAdmin ? 'Here’s what’s happening with faculty portfolios across Bulan Campus.' : 'Here’s an overview of your faculty portfolio and recent activity.'} action={<button className="btn btn-outline" onClick={() => onNavigate('Reports')}><Icon name="report" size={16} /> View reports</button>} />
    <div className="stats-grid">{isAdmin && <StatCard label="Total faculty" value={faculty.length} detail="Registered at Bulan Campus" icon="users" tone="blue" />}<StatCard label={isAdmin ? 'Completed portfolios' : 'Portfolio records'} value={isAdmin ? completed : files.length} detail={isAdmin ? 'All requirements submitted' : 'Categories with a document'} icon="folder" tone="green" /><StatCard label={isAdmin ? 'Pending submissions' : 'Pending requirements'} value={isAdmin ? pending : 17 - files.length} detail={isAdmin ? 'No documents submitted' : 'Categories to complete'} icon="calendar" tone="amber" /><StatCard label={isAdmin ? 'In progress' : 'In-progress submissions'} value={isAdmin ? inProgress : files.length} detail={isAdmin ? 'Submissions underway' : 'Documents submitted'} icon="chart" tone="purple" progress={!isAdmin ? avg : undefined} /></div>
    <div className="dashboard-grid"><section className="panel overview-panel"><div className="panel-heading"><div><h2>{isAdmin ? 'Faculty submission overview' : 'Portfolio completion'}</h2><p>{isAdmin ? 'Latest portfolio status for registered faculty.' : 'Your requirements at a glance.'}</p></div><button className="link-button" onClick={() => onNavigate(isAdmin ? 'Manage Faculty' : 'My Portfolio')}>View all <span>→</span></button></div>
      {isAdmin ? <div className="table-wrap"><table><thead><tr><th>FACULTY MEMBER</th><th>ACADEMIC RANK</th><th>DEPARTMENT</th><th>COMPLETION</th><th>STATUS</th><th /></tr></thead><tbody>{faculty.slice(0, 5).map((person) => <tr key={person.id}><td><PersonCell person={person} /></td><td>{person.rank}</td><td>{person.department}</td><td><CompletionCell value={completion(person.id)} /></td><td><StatusBadge status={statusOf(person.id)} /></td><td><button className="row-action" aria-label={`View ${person.name}`} onClick={() => { onSelectFaculty(person.id); onNavigate('Faculty Portfolios') }}><Icon name="eye" size={16} /></button></td></tr>)}</tbody></table></div>
      : <><div className="completion-display"><div className="donut" style={{ '--percent': `${completion(faculty[0]?.id ?? '')}%` } as React.CSSProperties}><div><b>{completion(faculty[0]?.id ?? '')}%</b><span>complete</span></div></div><div className="completion-copy"><h3>Keep up the great work!</h3><p>You’ve submitted {files.length} of {categories.length} portfolio categories.</p><button className="btn btn-primary btn-small" onClick={() => onNavigate('My Portfolio')}>Continue portfolio <span>→</span></button></div></div><div className="category-progress"><div className="progress-row"><span>Submitted</span><b>{files.length}</b><div><i style={{ width: `${completion(faculty[0]?.id ?? '')}%` }} /></div></div><div className="progress-row pending-row"><span>Remaining</span><b>{Math.max(0, categories.length - files.length)}</b><div><i style={{ width: `${100 - completion(faculty[0]?.id ?? '')}%` }} /></div></div></div></>}
    </section><section className="panel activity-panel"><div className="panel-heading"><div><h2>{isAdmin ? 'Recent submissions' : 'Recent activity'}</h2><p>{isAdmin ? 'Latest faculty document uploads.' : 'Your latest portfolio updates.'}</p></div></div><div className="activity-list">{recent.length ? recent.map((file, index) => <div className="activity-item" key={`${file.facultyId}-${file.category}`}><div className={`activity-dot dot-${index % 4}`}><Icon name="upload" size={15} /></div><div className="activity-info"><b>{isAdmin ? faculty.find((person) => person.id === file.facultyId)?.name : file.category}</b><span>{isAdmin ? file.category : file.fileName}</span></div><time>{relativeDate(file.updatedAt)}</time></div>) : <EmptyState title="No activity yet" text="Uploaded documents will appear here." />}</div><button className="activity-footer" onClick={() => onNavigate(isAdmin ? 'Faculty Portfolios' : 'My Portfolio')}>See all portfolio activity <span>→</span></button></section></div>
  </>
}

function PersonCell({ person }: { person: Faculty }) { return <div className="person-cell"><div className="avatar small">{person.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div><div><b>{person.name}</b><span>{person.email}</span></div></div> }
function CompletionCell({ value }: { value: number }) { return <div className="completion-cell"><div className="table-progress"><i style={{ width: `${value}%` }} /></div><span>{value}%</span></div> }
function StatusBadge({ status }: { status: Status }) { return <span className={`status-badge ${status.toLowerCase()}`}><i />{status}</span> }
function relativeDate(value: string) { const days = Math.floor((Date.now() - new Date(value).getTime()) / 86400000); return days < 1 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago` }
function EmptyState({ title, text }: { title: string; text: string }) { return <div className="empty-state"><div className="empty-icon"><Icon name="folder" size={20} /></div><b>{title}</b><span>{text}</span></div> }

function FacultyPage({ faculty, search, setSearch, onAdd, onEdit, onDelete, onView, completion, statusOf }: { faculty: Faculty[]; search: string; setSearch: (value: string) => void; onAdd: () => void; onEdit: (person: Faculty) => void; onDelete: (person: Faculty) => void; onView: (id: string) => void; completion: (id: string) => number; statusOf: (id: string) => Status }) {
  return <><PageHeading eyebrow="PEOPLE & ACCOUNTS" title="Manage faculty" description="Add, update, and manage faculty accounts for Bulan Campus." action={<button className="btn btn-primary" onClick={onAdd}><Icon name="plus" size={16} /> Add faculty member</button>} /><section className="panel data-panel"><div className="panel-toolbar"><div><h2>Faculty directory <span className="count-pill">{faculty.length}</span></h2><p>Faculty records and portfolio progress.</p></div><div className="search-box"><Icon name="search" size={16} /><input placeholder="Search faculty..." value={search} onChange={(event) => setSearch(event.target.value)} /></div></div><div className="table-wrap"><table><thead><tr><th>FACULTY MEMBER</th><th>ACADEMIC RANK</th><th>DEPARTMENT</th><th>PORTFOLIO COMPLETION</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>{faculty.map((person) => <tr key={person.id}><td><PersonCell person={person} /></td><td>{person.rank}</td><td>{person.department}</td><td><CompletionCell value={completion(person.id)} /></td><td><StatusBadge status={statusOf(person.id)} /></td><td><div className="table-actions"><button className="row-action" title="View portfolio" onClick={() => onView(person.id)}><Icon name="eye" size={16} /></button><button className="row-action" title="Edit faculty" onClick={() => onEdit(person)}><Icon name="edit" size={16} /></button><button className="row-action danger-action" title="Delete faculty" onClick={() => onDelete(person)}><Icon name="trash" size={16} /></button></div></td></tr>)}</tbody></table>{faculty.length === 0 && <EmptyState title="No faculty found" text="Try another search or add a new faculty member." />}</div><div className="table-foot">Showing {faculty.length} faculty member{faculty.length === 1 ? '' : 's'} <span>Updated just now</span></div></section></>
}

function PortfolioPage({ faculty, files, isAdmin, selectedFaculty, onSelectFaculty, onUpload, onRemove, onOpenFaculty }: { faculty: Faculty[]; files: PortfolioFile[]; isAdmin: boolean; selectedFaculty: string; onSelectFaculty: (id: string) => void; onUpload: (id: string, category: string, input: HTMLInputElement) => void; onRemove: (file: PortfolioFile) => void; onOpenFaculty: (id: string) => void }) {
  const person = faculty.find((item) => item.id === selectedFaculty) ?? faculty[0]
  const personFiles = person ? files.filter((file) => file.facultyId === person.id) : []
  const getFile = (category: string) => personFiles.find((file) => file.category === category)
  const pct = person ? Math.round(personFiles.length / categories.length * 100) : 0
  return <><PageHeading eyebrow="SUBMISSIONS & DOCUMENTS" title={isAdmin ? 'Faculty portfolios' : 'My portfolio'} description={isAdmin ? 'Review submitted documents and completion status by faculty member.' : 'Upload and manage your supporting portfolio documents.'} action={isAdmin && <button className="btn btn-outline" onClick={() => window.print()}><Icon name="download" size={16} /> Print summary</button>} />
    {isAdmin && <div className="panel portfolio-filter"><label htmlFor="faculty-picker">Viewing portfolio for</label><select id="faculty-picker" value={person?.id ?? ''} onChange={(event) => onSelectFaculty(event.target.value)}>{faculty.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.department}</option>)}</select>{person && <button className="link-button" onClick={() => onOpenFaculty(person.id)}>Faculty record →</button>}</div>}
    {person ? <><div className="portfolio-summary"><div className="portfolio-person"><div className="avatar">{person.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div><div><b>{person.name}</b><span>{person.rank} <i>·</i> {person.department}</span></div></div><div className="summary-completion"><span>{personFiles.length} of {categories.length} categories</span><b>{pct}% complete</b><div className="table-progress"><i style={{ width: `${pct}%` }} /></div></div></div>
      <section className="panel category-panel"><div className="panel-heading"><div><h2>Portfolio categories</h2><p>Accepted formats: PDF, DOCX, XLSX, JPG, PNG · Maximum file size 3 MB</p></div><span className="category-count">{personFiles.length}/{categories.length} submitted</span></div><div className="category-list">{categories.map((category, index) => { const file = getFile(category); return <div className="category-row" key={category}><div className="category-number">{String(index + 1).padStart(2, '0')}</div><div className={`category-file-icon ${file ? 'has-file' : ''}`}><Icon name={file ? 'report' : 'folder'} size={17} /></div><div className="category-info"><b>{category}</b><span>{file ? <>{file.fileName} <i>·</i> Updated {relativeDate(file.updatedAt).toLowerCase()}</> : 'No document uploaded'}</span></div><StatusBadge status={file ? 'Submitted' : 'Pending'} /><div className="category-actions">{file?.dataUrl && <><a className="row-action" href={file.dataUrl} target="_blank" rel="noreferrer" title="View document" aria-label={`View ${category} document`}><Icon name="eye" size={16} /></a><a className="row-action" href={file.dataUrl} download={file.fileName} title="Download document" aria-label={`Download ${category} document`}><Icon name="download" size={16} /></a></>}{file && <button className="row-action danger-action" title="Delete document" onClick={() => onRemove(file)}><Icon name="trash" size={16} /></button>}<label className="btn btn-upload"><Icon name={file ? 'edit' : 'upload'} size={14} />{file ? 'Replace' : 'Upload'}<input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" onChange={(event) => onUpload(person.id, category, event.currentTarget)} /></label></div></div>})}</div></section>
      {isAdmin && <section className="panel compact-summary"><div className="panel-heading"><div><h2>Faculty portfolio summary</h2><p>Submission overview for the selected faculty member.</p></div></div><div className="table-wrap"><table><thead><tr><th>NO.</th><th>NAME OF FACULTY</th><th>ACADEMIC RANK</th><th>PORTFOLIO CATEGORIES</th><th>SUBMISSION STATUS</th><th>ACTION</th></tr></thead><tbody><tr><td>01</td><td>{person.name}</td><td>{person.rank}</td><td>{personFiles.length} / {categories.length}</td><td><StatusBadge status={personFiles.length === categories.length ? 'Submitted' : personFiles.length ? 'Incomplete' : 'Pending'} /></td><td><button className="row-action" onClick={() => onOpenFaculty(person.id)}><Icon name="eye" size={16} /></button></td></tr></tbody></table></div></section>}
    </> : <EmptyState title="No faculty records yet" text="Create a faculty account to start managing portfolios." />}</>
}

function AnalyticsPage({ faculty, files, completion, statusOf, isAdmin }: { faculty: Faculty[]; files: PortfolioFile[]; completion: (id: string) => number; statusOf: (id: string) => Status; isAdmin: boolean }) {
  const completeCount = faculty.filter((person) => statusOf(person.id) === 'Submitted').length
  const pendingCount = faculty.filter((person) => statusOf(person.id) === 'Pending').length
  const inProgressCount = faculty.filter((person) => statusOf(person.id) === 'Incomplete').length
  const average = faculty.length ? Math.round(faculty.reduce((sum, person) => sum + completion(person.id), 0) / faculty.length) : 0
  const deptStats = departments.map((department) => ({ department, count: faculty.filter((person) => person.department === department).length, submitted: faculty.filter((person) => person.department === department).reduce((sum, person) => sum + files.filter((file) => file.facultyId === person.id).length, 0) }))
  const trend = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(new Date().getFullYear(), new Date().getMonth() - 11 + index, 1)
    const count = files.filter((file) => {
      const updated = new Date(file.updatedAt)
      return updated.getFullYear() === date.getFullYear() && updated.getMonth() === date.getMonth()
    }).length
    return { label: date.toLocaleDateString('en-US', { month: 'short' }), count }
  })
  const trendPeak = Math.max(1, ...trend.map((item) => item.count))
  return <><PageHeading eyebrow="INSIGHTS & PERFORMANCE" title={isAdmin ? 'Analytics dashboard' : 'My analytics'} description={isAdmin ? 'A campus-wide view of faculty portfolio progress and submissions.' : 'Track your portfolio completion and submission progress.'} action={<div className="period-select"><Icon name="calendar" size={15} /><select aria-label="Academic year"><option>AY 2025–2026</option><option>AY 2024–2025</option></select></div>} />
    <div className="stats-grid analytics-stats"><StatCard label="Overall completion" value={`${average}%`} detail="Average portfolio completion" icon="chart" tone="blue" progress={average} />{isAdmin && <StatCard label="Faculty members" value={faculty.length} detail="Registered at Bulan Campus" icon="users" tone="purple" />}<StatCard label="Completed submissions" value={completeCount} detail="All 17 categories submitted" icon="folder" tone="green" /><StatCard label="Pending submissions" value={pendingCount} detail="No documents submitted" icon="calendar" tone="amber" /><StatCard label="In progress" value={inProgressCount} detail="Portfolio submissions underway" icon="upload" tone="purple" /></div>
    <div className="analytics-grid"><section className="panel chart-panel"><div className="panel-heading"><div><h2>Portfolio submission trends</h2><p>Document uploads over the last 12 months</p></div><span className="chart-legend"><i /> Documents submitted</span></div><div className="bar-chart"><div className="chart-y-labels"><span>{trendPeak}</span><span>{Math.round(trendPeak * .75)}</span><span>{Math.round(trendPeak * .5)}</span><span>{Math.round(trendPeak * .25)}</span><span>0</span></div><div className="chart-bars">{trend.map((item) => <div className="chart-column" key={item.label}><div className="bar-track"><i style={{ height: `${item.count ? Math.max(4, item.count / trendPeak * 100) : 0}%` }} title={`${item.count} documents`} /></div><span>{item.label}</span></div>)}</div></div></section>
      <section className="panel chart-panel completion-chart"><div className="panel-heading"><div><h2>Faculty completion</h2><p>Portfolio completion by faculty</p></div></div>{faculty.length ? <div className="faculty-bars">{faculty.slice(0, 6).map((person) => <div className="faculty-bar-row" key={person.id}><span>{person.name.split(' ').slice(0, 2).join(' ')}</span><div className="table-progress"><i style={{ width: `${completion(person.id)}%` }} /></div><b>{completion(person.id)}%</b></div>)}</div> : <EmptyState title="No faculty data yet" text="Add a faculty member to view analytics." />}</section></div>
    <section className="panel department-panel"><div className="panel-heading"><div><h2>Department submission statistics</h2><p>Portfolio document submissions grouped by department.</p></div></div><div className="table-wrap"><table><thead><tr><th>DEPARTMENT</th><th>FACULTY MEMBERS</th><th>DOCUMENTS SUBMITTED</th><th>AVERAGE COMPLETION</th><th>SUBMISSION RATE</th></tr></thead><tbody>{deptStats.map((item) => { const people = faculty.filter((person) => person.department === item.department); const rate = people.length ? Math.round(people.reduce((sum, person) => sum + completion(person.id), 0) / people.length) : 0; return <tr key={item.department}><td><b>{item.department}</b></td><td>{people.length}</td><td>{item.submitted}</td><td>{rate}%</td><td><CompletionCell value={rate} /></td></tr> })}</tbody></table></div></section>
  </>
}

function ReportsPage({ faculty, files, statusOf }: { faculty: Faculty[]; files: PortfolioFile[]; statusOf: (id: string) => Status }) {
  const [reportType, setReportType] = useState('Faculty portfolio summary')
  const [period, setPeriod] = useState('AY 2025–2026')
  const [selectedFacultyId, setSelectedFacultyId] = useState(faculty[0]?.id ?? '')
  const [generated, setGenerated] = useState(false)
  const reportFaculty = reportType === 'Individual faculty portfolio report' ? faculty.filter((person) => person.id === selectedFacultyId) : faculty
  const reportRows: { name: string; rank: string; department: string; category: string; status: Status }[] = reportFaculty.flatMap((person) => {
    const own = files.filter((file) => file.facultyId === person.id)
    if (reportType === 'Faculty portfolio completion report' || reportType === 'Department portfolio submission report') return [{ name: person.name, rank: person.rank, department: person.department, category: 'All categories', status: statusOf(person.id) }]
    return categories.map((category) => ({ name: person.name, rank: person.rank, department: person.department, category, status: own.some((file) => file.category === category) ? 'Submitted' : 'Pending' }))
  })
  const generate = () => setGenerated(true)
  const exportCsv = () => {
    const header = ['Faculty Name', 'Academic Rank', 'Department', 'Portfolio Category', 'Submission Status', 'Academic Year']
    const rows = reportRows.map((row) => [row.name, row.rank, row.department, row.category, row.status, period])
    const csv = [header, ...rows].map((row) => row.map((field) => `"${String(field).replaceAll('"', '""')}"`).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'sorsu-faculty-portfolio-report.csv'
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return (
    <>
      <PageHeading eyebrow="REPORTS & EXPORTS" title="Reports" description="Generate and export structured faculty portfolio reports." />
      <section className="panel report-generator">
        <div className="report-icon"><Icon name="report" size={22} /></div>
        <div className="report-generator-copy"><h2>Build a portfolio report</h2><p>Choose the report and academic period to get started.</p></div>
        <div className="report-options">
          <label>Report type
            <select value={reportType} onChange={(event) => { setReportType(event.target.value); setGenerated(false) }}>
              <option>Faculty portfolio summary</option>
              <option>Individual faculty portfolio report</option>
              <option>Faculty portfolio completion report</option>
              <option>Department portfolio submission report</option>
            </select>
          </label>
          {reportType === 'Individual faculty portfolio report' && (
            <label>Faculty member
              <select value={selectedFacultyId} onChange={(event) => { setSelectedFacultyId(event.target.value); setGenerated(false) }}>
                {faculty.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
              </select>
            </label>
          )}
          <label>Academic year / semester
            <select value={period} onChange={(event) => { setPeriod(event.target.value); setGenerated(false) }}>
              <option>AY 2025–2026</option>
              <option>1st Semester, AY 2025–2026</option>
              <option>2nd Semester, AY 2025–2026</option>
              <option>Summer, AY 2025–2026</option>
              <option>AY 2024–2025</option>
            </select>
          </label>
          <button className="btn btn-primary" onClick={generate}>Generate report <span>→</span></button>
        </div>
      </section>
      <section className="panel report-results">
        <div className="panel-heading">
          <div>
            <h2>{generated ? reportType : 'Report preview'} <span className="count-pill">{generated ? reportRows.length : 0}</span></h2>
            <p>{generated ? `${period} · Generated ${new Date().toLocaleDateString()}` : 'Your generated report will appear here.'}</p>
          </div>
          {generated && (
            <div className="report-actions">
              <button className="btn btn-outline btn-small" onClick={exportCsv}><Icon name="download" size={15} /> Export Excel / CSV</button>
              <button className="btn btn-primary btn-small" onClick={() => window.print()}><Icon name="report" size={15} /> Download PDF / Print</button>
            </div>
          )}
        </div>
        {generated ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>FACULTY NAME</th><th>ACADEMIC RANK</th><th>DEPARTMENT</th><th>PORTFOLIO CATEGORY</th><th>SUBMISSION STATUS</th></tr></thead>
              <tbody>{reportRows.map((row, index) => <tr key={`${row.name}-${row.category}-${index}`}><td>{row.name}</td><td>{row.rank}</td><td>{row.department}</td><td>{row.category}</td><td><StatusBadge status={row.status} /></td></tr>)}</tbody>
            </table>
          </div>
        ) : (
          <div className="report-empty">
            <div className="report-empty-icon"><Icon name="report" size={24} /></div>
            <b>No report generated yet</b>
            <span>Select a report type and academic period, then generate your report.</span>
          </div>
        )}
      </section>
    </>
  )
}

function ProfilePage({ person, onEdit }: { person: Faculty; onEdit: () => void }) {
  return <><PageHeading eyebrow="ACCOUNT SETTINGS" title="My profile" description="View and update your faculty information." action={<button className="btn btn-primary" onClick={onEdit}><Icon name="edit" size={16} /> Edit profile</button>} /><section className="panel profile-card"><div className="profile-cover" /><div className="profile-main"><div className="avatar profile-avatar">{person.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div><div className="profile-heading"><h2>{person.name}</h2><span>{person.rank} <i>·</i> {person.department}</span></div><span className="profile-member">FACULTY MEMBER</span></div><div className="profile-details"><div><span>Full name</span><b>{person.name}</b></div><div><span>Email address</span><b>{person.email}</b></div><div><span>Academic rank</span><b>{person.rank}</b></div><div><span>Department</span><b>{person.department}</b></div><div><span>Campus</span><b>SorSU · Bulan Campus</b></div><div><span>Account role</span><b>Faculty member</b></div></div><div className="profile-note"><Icon name="close" size={16} /><span>For account security, contact your administrator to change your password.</span></div></section></>
}

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) { return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="modal" role="dialog" aria-modal="true" aria-label={title}><div className="modal-header"><h2>{title}</h2><button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" /></button></div>{children}</section></div> }
function FacultyForm({ person, onSubmit, onCancel, profileOnly = false }: { person: Faculty | null; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onCancel: () => void; profileOnly?: boolean }) {
  return <form className="faculty-form" onSubmit={onSubmit}><label>Full name<input name="name" defaultValue={person?.name} placeholder="e.g. Maria Lourdes Reyes" minLength={3} required /></label><label>Email address<input name="email" type="email" defaultValue={person?.email} placeholder="name@sorsu.edu.ph" required /></label><div className="form-grid"><label>Academic rank<select name="rank" defaultValue={person?.rank ?? ''} required><option value="" disabled>Select rank</option>{ranks.map((rank) => <option key={rank}>{rank}</option>)}</select></label><label>Department<select name="department" defaultValue={person?.department ?? ''} required><option value="" disabled>Select department</option>{departments.map((dept) => <option key={dept}>{dept}</option>)}</select></label></div>{!person && !profileOnly && <p className="form-hint">A temporary password will be assigned: <b>faculty123</b></p>}<div className="modal-actions"><button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button><button type="submit" className="btn btn-primary">{profileOnly ? 'Save changes' : person ? 'Save changes' : 'Add faculty member'}</button></div></form>
}

export default App
