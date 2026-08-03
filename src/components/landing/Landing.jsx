"use client"

import {
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react"
import {
	ArrowRight,
	BookOpen,
	CalendarDays,
	Check,
	CheckCircle2,
	ChevronDown,
	CirclePlay,
	ClipboardCheck,
	Clock3,
	FileOutput,
	Image,
	LayoutDashboard,
	Languages,
	Library,
	Menu,
	MessageSquareText,
	PanelLeft,
	Play,
	Plus,
	Search,
	ScanLine,
	School,
	Send,
	Sparkles,
	SquarePen,
	TestTube2,
	Undo2,
	Redo2,
	Users,
	X,
} from "lucide-react"
import { LANGUAGE_OPTIONS, translate } from "./i18n"

const ASSET_ROOT = "/images/landing"
const bilimLogo = `${ASSET_ROOT}/new-bilimai-logo.svg`
const bifPartnerLogo = `${ASSET_ROOT}/partners/bif.png`
const bilPartnerLogo = `${ASSET_ROOT}/partners/bil.png`
const nurordaPartnerLogo = `${ASSET_ROOT}/partners/nurorda-logo.png`
const sdlPartnerLogo = `${ASSET_ROOT}/partners/sdl.png`
const sduPartnerLogo = `${ASSET_ROOT}/partners/sdu.png`
const spectrumPartnerLogo = `${ASSET_ROOT}/partners/spectrum.png`
const mitosisCover = `${ASSET_ROOT}/marketplace-lessons/mitosis.jpg`
const parallaxCover = `${ASSET_ROOT}/marketplace-lessons/parallax.jpg`
const lcOscillationsCover = `${ASSET_ROOT}/marketplace-lessons/lc-oscillations.jpg`
const photosynthesisCover = `${ASSET_ROOT}/marketplace-lessons/photosynthesis.jpg`
const diversityAnimalsCover = `${ASSET_ROOT}/marketplace-lessons/diversity-animals.jpg`
const chemicalKineticsCover = `${ASSET_ROOT}/marketplace-lessons/chemical-kinetics.jpg`
const carbonSiliconCover = `${ASSET_ROOT}/marketplace-lessons/carbon-silicon.jpg`
const kazakhstanWwiiCover = `${ASSET_ROOT}/marketplace-lessons/kazakhstan-wwii.jpg`
const independenceKazakhstanCover = `${ASSET_ROOT}/marketplace-lessons/independence-kazakhstan.jpg`
const geometricSequencesCover = `${ASSET_ROOT}/marketplace-lessons/geometric-sequences.jpg`
const combinedEventsCover = `${ASSET_ROOT}/marketplace-lessons/combined-events.jpg`
const graphingLinesCover = `${ASSET_ROOT}/marketplace-lessons/graphing-lines.jpg`

const APP_ORIGIN = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "")
const WAITLIST_PROXY_ENDPOINT = "/api/waitlist"
const WAITLIST_API_ENDPOINT =
	process.env.NEXT_PUBLIC_WAITLIST_API_URL ||
	"https://api.dev.bilimai.kz/api/v1/auth/waitlist/"
const appUrl = (path) => `${APP_ORIGIN}${path}`
const WHATSAPP_NUMBER_ERROR =
	"Введите номер в международном формате, например +7 700 000 00 00."
const DEFAULT_LANGUAGE = "kk"
const LANGUAGE_STORAGE_KEY = "bilim-landing-language"
const LANGUAGE_CHANGE_EVENT = "bilim-landing-language-change"
const supportedLanguages = new Set(
	LANGUAGE_OPTIONS.map((option) => option.code),
)
let inMemoryLanguage = DEFAULT_LANGUAGE

const getLanguageSnapshot = () => {
	try {
		const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
		return supportedLanguages.has(storedLanguage)
			? storedLanguage
			: inMemoryLanguage
	} catch {
		return inMemoryLanguage
	}
}

const subscribeToLanguage = (onLanguageChange) => {
	const handleStorage = (event) => {
		if (event.key === LANGUAGE_STORAGE_KEY) onLanguageChange()
	}

	window.addEventListener("storage", handleStorage)
	window.addEventListener(LANGUAGE_CHANGE_EVENT, onLanguageChange)

	return () => {
		window.removeEventListener("storage", handleStorage)
		window.removeEventListener(LANGUAGE_CHANGE_EVENT, onLanguageChange)
	}
}

const setStoredLanguage = (language) => {
	if (!supportedLanguages.has(language)) return
	inMemoryLanguage = language
	try {
		window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
	} catch {
		// The switcher still works when browser storage is unavailable.
	}
	window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT))
}

function useStoredLanguage() {
	const [language, setLanguage] = useState(DEFAULT_LANGUAGE)

	useEffect(() => {
		const syncLanguage = () => setLanguage(getLanguageSnapshot())
		const unsubscribe = subscribeToLanguage(syncLanguage)
		syncLanguage()
		return unsubscribe
	}, [])

	return language
}

const postWaitlistJson = (endpoint, data) =>
	fetch(endpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify(data),
	})

const postWaitlistWithoutCors = (data) =>
	fetch(WAITLIST_API_ENDPOINT, {
		method: "POST",
		mode: "no-cors",
		body: new URLSearchParams(data),
	})

const isValidWhatsAppNumber = (value) => {
	const normalized = value.replace(/[\s().-]/g, "")
	return /^\+[1-9]\d{9,14}$/.test(normalized)
}

const LanguageContext = createContext(null)

function useI18n() {
	const context = useContext(LanguageContext)
	if (!context) throw new Error("useI18n must be used inside LanguageContext")
	return context
}

function Logo() {
	const { t } = useI18n()
	return (
		<a
			className='brand'
			href='#top'
			aria-label={t("Bilim AI — на главную")}
		>
			<img src={bilimLogo} alt='Bilim AI' />
		</a>
	)
}

function WaitlistButton({ onClick, className = "" }) {
	const { t } = useI18n()
	return (
		<button
			className={`button ${className}`}
			type='button'
			onClick={onClick}
		>
			<span>{t("Получить ранний доступ")}</span>
			<ArrowRight size={17} strokeWidth={2.2} aria-hidden='true' />
		</button>
	)
}

function WaitlistModal({ open, onClose }) {
	const { t } = useI18n()
	const [form, setForm] = useState({ name: "", email: "", phone: "" })
	const [status, setStatus] = useState("idle")
	const [error, setError] = useState("")
	const [phoneError, setPhoneError] = useState("")
	const nameInputRef = useRef(null)
	const dialogRef = useRef(null)
	const dragStartYRef = useRef(null)

	useEffect(() => {
		if (!open) return undefined

		const previousOverflow = document.body.style.overflow
		const handleKeyDown = (event) => {
			if (event.key === "Escape") onClose()
		}

		document.body.style.overflow = "hidden"
		window.addEventListener("keydown", handleKeyDown)
		if (window.matchMedia("(min-width: 681px)").matches) {
			window.requestAnimationFrame(() => nameInputRef.current?.focus())
		}

		return () => {
			document.body.style.overflow = previousOverflow
			window.removeEventListener("keydown", handleKeyDown)
		}
	}, [open, onClose])

	if (!open) return null

	const updateField = (event) => {
		const { name, value } = event.target
		setForm((current) => ({ ...current, [name]: value }))
		if (name === "phone" && phoneError) setPhoneError("")
	}

	const startSheetDrag = (event) => {
		dragStartYRef.current = event.clientY
		event.currentTarget.setPointerCapture(event.pointerId)
		if (dialogRef.current) dialogRef.current.style.transition = "none"
	}

	const moveSheetDrag = (event) => {
		if (dragStartYRef.current === null || !dialogRef.current) return
		const offset = Math.max(0, event.clientY - dragStartYRef.current)
		dialogRef.current.style.transform = `translateY(${offset}px)`
	}

	const endSheetDrag = (event) => {
		if (dragStartYRef.current === null || !dialogRef.current) return
		const offset = Math.max(0, event.clientY - dragStartYRef.current)
		dragStartYRef.current = null
		dialogRef.current.style.transition =
			"transform 220ms cubic-bezier(0.22, 1, 0.36, 1)"

		if (offset > 90) {
			onClose()
			return
		}

		dialogRef.current.style.transform = "translateY(0)"
	}

	const submit = async (event) => {
		event.preventDefault()
		if (!isValidWhatsAppNumber(form.phone)) {
			setPhoneError(t(WHATSAPP_NUMBER_ERROR))
			return
		}

		setStatus("submitting")
		setError("")

		try {
			const requestData = {
				name: form.name.trim(),
				phone: form.phone.trim(),
				email: form.email.trim(),
			}
			let response
			let usedServerProxy = false

			try {
				response = await postWaitlistJson(
					WAITLIST_API_ENDPOINT,
					requestData,
				)
			} catch {
				usedServerProxy = true
				try {
					response = await postWaitlistJson(
						WAITLIST_PROXY_ENDPOINT,
						requestData,
					)
				} catch {
					await postWaitlistWithoutCors(requestData)
					setStatus("success")
					return
				}
			}

			if (usedServerProxy && response.status === 502) {
				await postWaitlistWithoutCors(requestData)
				setStatus("success")
				return
			}

			let payload = null
			try {
				payload = await response.json()
			} catch {
				payload = null
			}

			if (!response.ok) {
				const fieldError = ["name", "email", "phone"]
					.map((field) => payload?.[field])
					.flat()
					.find(Boolean)
				let message
				if (response.status === 404) {
					message = t(
						"Сервис раннего доступа не найден. Проверьте адрес API.",
					)
				} else if (response.status >= 500) {
					message = t(
						"Сервис временно недоступен. Попробуйте ещё раз чуть позже.",
					)
				} else if (
					typeof payload?.detail === "string" ||
					typeof fieldError === "string"
				) {
					message = t(
						"Сервер отклонил заявку. Проверьте введённые данные.",
					)
				} else {
					message = t(
						"Не удалось отправить заявку. Проверьте данные и попробуйте ещё раз.",
					)
				}
				throw new Error(message)
			}

			setStatus("success")
		} catch (requestError) {
			setError(
				requestError instanceof TypeError
					? t(
							"Не удалось связаться с сервером. Проверьте подключение или настройки API.",
						)
					: requestError instanceof Error
						? requestError.message
						: t("Не удалось отправить заявку. Попробуйте ещё раз."),
			)
			setStatus("error")
		}
	}

	return (
		<div
			className='waitlist-modal'
			onMouseDown={(event) => {
				if (event.target === event.currentTarget) onClose()
			}}
		>
			<section
				ref={dialogRef}
				className='waitlist-modal__dialog'
				role='dialog'
				aria-modal='true'
				aria-labelledby='waitlist-title'
			>
				<div
					className='waitlist-modal__drag-handle'
					aria-hidden='true'
					onPointerDown={startSheetDrag}
					onPointerMove={moveSheetDrag}
					onPointerUp={endSheetDrag}
					onPointerCancel={endSheetDrag}
				>
					<span />
				</div>
				<button
					className='waitlist-modal__close'
					type='button'
					aria-label={t("Закрыть")}
					onClick={onClose}
				>
					<X size={20} />
				</button>

				{status === "success" ? (
					<div className='waitlist-modal__success' aria-live='polite'>
						<span>
							<CheckCircle2 size={27} />
						</span>
						<small>{t("Заявка принята")}</small>
						<h2 id='waitlist-title'>{t("Вы в списке ожидания")}</h2>
						<p>
							{t(
								"Свяжемся с вами в WhatsApp, когда Bilim AI будет готов к раннему доступу.",
							)}
						</p>
						<button
							className='button button--primary'
							type='button'
							onClick={onClose}
						>
							{t("Готово")}
						</button>
					</div>
				) : (
					<>
						<header className='waitlist-modal__header'>
							<span>{t("Ранний доступ")}</span>
							<h2 id='waitlist-title'>
								{t("Откройте Bilim AI первыми")}
							</h2>
							<p>
								{t(
									"Участникам списка ожидания мы откроем все премиум-функции на старте — бесплатно.",
								)}
							</p>
						</header>

						<form
							className='waitlist-modal__form'
							onSubmit={submit}
						>
							<label>
								<span>
									{t("ФИО")}{" "}
									<b
										className='waitlist-modal__required'
										aria-hidden='true'
									>
										*
									</b>
								</span>
								<input
									ref={nameInputRef}
									name='name'
									value={form.name}
									onChange={updateField}
									autoComplete='name'
									placeholder={t("Ваше имя и фамилия")}
									required
								/>
							</label>
							<label>
								<span>
									{t("WhatsApp номер")}{" "}
									<b
										className='waitlist-modal__required'
										aria-hidden='true'
									>
										*
									</b>
								</span>
								<input
									name='phone'
									type='tel'
									inputMode='tel'
									value={form.phone}
									onChange={updateField}
									onBlur={() =>
										setPhoneError(
											isValidWhatsAppNumber(form.phone)
												? ""
												: t(WHATSAPP_NUMBER_ERROR),
										)
									}
									autoComplete='tel'
									placeholder='+7 700 000 00 00'
									maxLength={24}
									aria-invalid={Boolean(phoneError)}
									aria-describedby={
										phoneError
											? "waitlist-phone-error"
											: undefined
									}
									required
								/>
								{phoneError ? (
									<small
										className='waitlist-modal__field-error'
										id='waitlist-phone-error'
										role='alert'
									>
										{phoneError}
									</small>
								) : null}
							</label>
							<label>
								<span>
									{t("Email")}{" "}
									<b
										className='waitlist-modal__required'
										aria-hidden='true'
									>
										*
									</b>
								</span>
								<input
									name='email'
									type='email'
									value={form.email}
									onChange={updateField}
									autoComplete='email'
									placeholder='name@example.com'
									required
								/>
							</label>

							{error ? (
								<p
									className='waitlist-modal__error'
									role='alert'
								>
									{error}
								</p>
							) : null}

							<button
								className='button button--primary waitlist-modal__submit'
								type='submit'
								disabled={status === "submitting"}
								aria-busy={status === "submitting"}
							>
								{status === "submitting"
									? t("Отправляем…")
									: t("Присоединиться к списку")}
								{status === "submitting" ? null : (
									<ArrowRight
										size={17}
										strokeWidth={2.2}
										aria-hidden='true'
									/>
								)}
							</button>
							<small className='waitlist-modal__privacy'>
								{t(
									"Контакты нужны только для приглашения в ранний доступ.",
								)}
							</small>
						</form>
					</>
				)}
			</section>
		</div>
	)
}

function Navigation() {
	const [open, setOpen] = useState(false)
	const { language, setLanguage, t } = useI18n()
	const currentLanguage =
		LANGUAGE_OPTIONS.find((option) => option.code === language) ||
		LANGUAGE_OPTIONS[0]

	useEffect(() => {
		const close = () => setOpen(false)
		window.addEventListener("resize", close)
		return () => window.removeEventListener("resize", close)
	}, [])

	return (
		<nav className='nav-shell' aria-label={t("Основная навигация")}>
			<Logo />
			<button
				className='nav-toggle'
				type='button'
				aria-label={t(open ? "Закрыть меню" : "Открыть меню")}
				aria-expanded={open}
				onClick={() => setOpen((value) => !value)}
			>
				{open ? <X size={22} /> : <Menu size={22} />}
			</button>
			<div className={`nav-menu ${open ? "nav-menu--open" : ""}`}>
				<div className='nav-links'>
					<a href='#product' onClick={() => setOpen(false)}>
						{t("Возможности")}
					</a>
					<a href='#workflow' onClick={() => setOpen(false)}>
						{t("Как работает")}
					</a>
					<a href='#classes' onClick={() => setOpen(false)}>
						{t("Для классов")}
					</a>
					<a href='#faq' onClick={() => setOpen(false)}>
						{t("Вопросы")}
					</a>
				</div>
				<div className='nav-actions'>
					<label className='language-switcher'>
						<Languages size={17} aria-hidden='true' />
						<span className='sr-only'>{t("Выбрать язык")}</span>
						<span
							className='language-switcher__value'
							aria-hidden='true'
						>
							{currentLanguage.short}
						</span>
						<select
							value={language}
							onChange={(event) => {
								setLanguage(event.target.value)
								setOpen(false)
							}}
							aria-label={t("Выбрать язык")}
						>
							{LANGUAGE_OPTIONS.map((option) => (
								<option value={option.code} key={option.code}>
									{option.short}
								</option>
							))}
						</select>
						<ChevronDown size={14} aria-hidden='true' />
					</label>
				</div>
			</div>
		</nav>
	)
}

const PRODUCT_NAV = [
	[LayoutDashboard, "Главная", "home"],
	[Search, "Галерея", "gallery"],
	[MessageSquareText, "Bilim Note", "notes"],
	[BookOpen, "Уроки", "lessons"],
	[CalendarDays, "Учебные планы", "syllabus"],
	[ClipboardCheck, "Тесты", "tests"],
	[Users, "Классы", "classes"],
]

function BilimSidebar({ active = "home" }) {
	const { language, t } = useI18n()
	const languageShort =
		LANGUAGE_OPTIONS.find((option) => option.code === language)?.short ||
		"ҚАЗ"
	return (
		<aside className='bilim-ui-sidebar'>
			<div className='bilim-ui-sidebar__brand'>
				<img src={bilimLogo} alt='' />
				<PanelLeft size={14} />
			</div>
			<nav>
				{PRODUCT_NAV.map(([Icon, label, key]) => (
					<span
						className={active === key ? "is-active" : ""}
						key={key}
					>
						<Icon size={14} />
						{t(label)}
					</span>
				))}
			</nav>
			<footer>
				<span>{languageShort}</span>
				<div>
					<i>А</i>Айгуль
				</div>
			</footer>
		</aside>
	)
}

function BilimPlanUI({ className = "" }) {
	const { t } = useI18n()
	const topics = [
		["01", "Электризация тел", "2 урока", "ready"],
		["02", "Электрический ток", "4 урока", "active"],
		["03", "Закон Ома", "3 урока", ""],
		["04", "Работа и мощность тока", "3 урока", ""],
	]

	return (
		<div className={`bilim-ui-screen bilim-ui-screen--plan ${className}`}>
			<BilimSidebar active='syllabus' />
			<main className='bilim-plan-ui'>
				<header>
					<div>
						<small>{t("ПЛАНИРОВАНИЕ ПО ПРОГРАММЕ")}</small>
						<h3>{t("Учебные планы")}</h3>
					</div>
					<button type='button'>
						<Plus size={12} /> {t("Создать план")}
					</button>
				</header>
				<div className='bilim-plan-ui__filters'>
					<span>{t("Физика")}</span>
					<span>{t("8 класс")}</span>
					<span>2026–2027</span>
				</div>
				<section className='bilim-plan-ui__board'>
					<div className='bilim-plan-ui__quarters'>
						<span>{t("I четверть")}</span>
						<span className='is-active'>{t("II четверть")}</span>
						<span>{t("III четверть")}</span>
						<span>{t("IV четверть")}</span>
					</div>
					<div className='bilim-plan-ui__rows'>
						{topics.map(([number, title, count, state]) => (
							<div
								className={state ? `is-${state}` : ""}
								key={title}
							>
								<i>{number}</i>
								<strong>{t(title)}</strong>
								<small>{t(count)}</small>
								{state === "ready" ? (
									<CheckCircle2 size={13} />
								) : (
									<ArrowRight size={13} />
								)}
							</div>
						))}
					</div>
				</section>
			</main>
		</div>
	)
}

function BilimEditorUI({ question = false, className = "" }) {
	const { t } = useI18n()
	return (
		<div
			className={`bilim-ui-screen bilim-ui-screen--editor ${question ? "is-question" : "is-lesson"} ${className}`}
		>
			<header className='bilim-editor-ui__toolbar'>
				<span className='bilim-editor-ui__home'>
					<img src={bilimLogo} alt='' />
					<ChevronDown size={10} />
				</span>
				<strong>
					{t(
						question
							? "СОР · Электрические колебания"
							: "Электромагнитные колебания",
					)}
				</strong>
				<span className='bilim-editor-ui__history'>
					<i>
						<Undo2 size={12} />
					</i>
					<i>
						<Redo2 size={12} />
					</i>
				</span>
				<span className='bilim-editor-ui__zoom'>
					100% <ChevronDown size={9} />
				</span>
				<b />
				<button className='is-share' type='button'>
					<Send size={11} /> {t("Поделиться")}
				</button>
				<button type='button'>
					<Play size={11} /> {t("Показать")}
				</button>
			</header>

			<aside className='bilim-editor-ui__assistant'>
				<header>
					<strong>
						<Sparkles size={13} /> {t("AI assistant")}
					</strong>
					<span>{t("Очистить ×")}</span>
				</header>
				<p>
					{t(
						"Опишите, что изменить или создать — ассистент подготовит правки.",
					)}
				</p>
				<div>
					<span>{t("Что вы хотите изменить?")}</span>
					<footer>
						<Plus size={12} />
						<i />
						<button type='button'>
							<ArrowRight size={11} />
						</button>
					</footer>
				</div>
			</aside>

			<main className='bilim-editor-ui__workspace'>
				{question ? (
					<section className='bilim-question-canvas'>
						<header>
							<span>{t("Вопросов в блоке: 1")}</span>
							<b>1 · ABC</b>
							<i>+</i>
						</header>
						<h3>
							{t(
								"Как изменится период колебаний, если увеличить начальный заряд конденсатора?",
							)}
						</h3>
						<div className='bilim-question-canvas__options'>
							{[
								"Период увеличится",
								"Период уменьшится",
								"Период не изменится",
								"Зависит от напряжения",
							].map((answer, index) => (
								<div
									className={index === 2 ? "is-correct" : ""}
									key={answer}
								>
									<i>
										{index === 2 ? <Check size={10} /> : ""}
									</i>
									<strong>{t(answer)}</strong>
									<small>
										{t(
											index === 2
												? "T = 2π√LC не зависит от заряда."
												: "Добавьте пояснение к варианту.",
										)}
									</small>
								</div>
							))}
						</div>
						<footer>
							<strong>{t("Объяснение")}</strong>
							<span>
								{t(
									"Энергия переходит между электрическим и магнитным полями.",
								)}
							</span>
						</footer>
					</section>
				) : (
					<section className='bilim-lesson-canvas'>
						<div className='bilim-lesson-canvas__art'>
							<i />
							<i />
							<i />
						</div>
						<div className='bilim-lesson-canvas__copy'>
							<small>{t("ФИЗИКА · 8 КЛАСС")}</small>
							<h3>{t("Электромагнитные колебания")}</h3>
							<p>
								{t(
									"Как энергия переходит между электрическим и магнитным полями",
								)}
							</p>
						</div>
					</section>
				)}
			</main>

			<aside className='bilim-editor-ui__tools'>
				{[BookOpen, MessageSquareText, Image, SquarePen].map(
					(Icon, index) => (
						<span
							className={index === 0 ? "is-active" : ""}
							key={index}
						>
							<Icon size={14} />
						</span>
					),
				)}
			</aside>

			<div className='bilim-editor-ui__slides'>
				{["01", "02", "03", "04", "05", question ? "MCQ" : "06"].map(
					(slide, index) => (
						<span
							className={
								index === (question ? 5 : 0) ? "is-active" : ""
							}
							key={slide}
						>
							<i>{slide}</i>
							<b />
						</span>
					),
				)}
				<button type='button'>
					<Plus size={15} />
				</button>
			</div>
		</div>
	)
}

function BilimGalleryUI({ className = "" }) {
	const subjects = [
		"Все",
		"Биология",
		"Химия",
		"География",
		"История",
		"Математика",
		"Физика",
	]
	const topics = [
		"Клетка",
		"Внутренние системы",
		"Эволюция",
		"Электромагнетизм",
		"Механика",
		"Астрономия",
	]
	return (
		<div
			className={`bilim-ui-screen bilim-ui-screen--gallery ${className}`}
		>
			<BilimSidebar active='gallery' />
			<main className='bilim-gallery-ui'>
				<header>
					<h3>Готовые уроки</h3>
					<div>
						<span>Создать</span>
						<span className='is-active'>
							<Search size={11} /> Поиск
						</span>
					</div>
				</header>
				<div className='bilim-gallery-ui__search'>
					<Search size={13} /> Найти урок...
				</div>
				<div className='bilim-gallery-ui__subjects'>
					{subjects.map((subject, index) => (
						<span
							className={index === 0 ? "is-active" : ""}
							key={subject}
						>
							{subject}
						</span>
					))}
				</div>
				<section>
					<header>
						<strong>Популярные темы</strong>
						<span>Смотреть все →</span>
					</header>
					<div className='bilim-gallery-ui__topics'>
						{topics.map((topic, index) => (
							<div
								className={index % 3 === 0 ? "is-violet" : ""}
								key={topic}
							>
								<strong>{topic}</strong>
								<small>{(index % 2) + 2} урока</small>
								<i />
							</div>
						))}
					</div>
				</section>
				<section>
					<header>
						<strong>Подборки по программе</strong>
						<span>Смотреть все →</span>
					</header>
					<div className='bilim-gallery-ui__sets'>
						{[
							"Биология · 7 класс",
							"Физика · 8 класс",
							"История · 9 класс",
						].map((title, index) => (
							<div className={`set-${index + 1}`} key={title}>
								<i />
								<strong>{title}</strong>
								<small>
									{index + 4} раздела · {index + 8} уроков
								</small>
							</div>
						))}
					</div>
				</section>
			</main>
		</div>
	)
}

function MiniBrowser({
	title,
	children,
	accent = "purple",
	className = "",
	initials,
}) {
	return (
		<div
			className={`mini-browser mini-browser--${accent} ${className}`}
			aria-label={title}
		>
			<div className='mini-browser__bar'>
				<span className='window-dots'>
					<i />
					<i />
					<i />
				</span>
				<span className='mini-browser__title'>{title}</span>
				<span className='mini-browser__status'>{initials}</span>
			</div>
			<div className='mini-browser__body'>{children}</div>
		</div>
	)
}

function FloatingCombinedEventsLesson() {
	return (
		<div className='float-card float-card--lesson hero-marketplace-card'>
			<MarketplaceLessonCard lesson={MARKETPLACE_LESSONS[6]} />
		</div>
	)
}

function FloatingPlan() {
	const { t } = useI18n()
	return (
		<MiniBrowser
			title={t("Учебный план")}
			initials='ДК'
			accent='orange'
			className='float-card float-card--plan'
		>
			<div className='plan-mini'>
				{["I четверть", "II четверть", "III четверть"].map(
					(label, index) => (
						<div className='plan-mini__row' key={label}>
							<span>{t(label)}</span>
							<i
								style={{ "--progress": `${78 - index * 17}%` }}
							/>
							<b>{["12/16", "8/15", "4/14"][index]}</b>
						</div>
					),
				)}
			</div>
		</MiniBrowser>
	)
}

function FloatingChemistryLesson() {
	return (
		<div className='float-card float-card--class hero-marketplace-card'>
			<MarketplaceLessonCard lesson={MARKETPLACE_LESSONS[8]} />
		</div>
	)
}

function FloatingTest() {
	const { t } = useI18n()
	return (
		<MiniBrowser
			title={t("СОР · Математика")}
			initials='ЕН'
			accent='pink'
			className='float-card float-card--test'
		>
			<div className='test-mini'>
				<span>2x + 4 = 16</span>
				<div className='test-mini__options'>
					<i>4</i>
					<i className='is-correct'>6</i>
					<i>8</i>
				</div>
				<small>
					<CheckCircle2 size={12} /> {t("Проверено автоматически")}
				</small>
			</div>
		</MiniBrowser>
	)
}

function FloatingClass() {
	const { t } = useI18n()
	return (
		<MiniBrowser
			title={t("7 «А» класс")}
			initials='АП'
			accent='green'
			className='float-card float-card--results'
		>
			<div className='class-mini'>
				<div className='class-mini__summary'>
					<strong>{t("24 ученика")}</strong>
					<span>{t("Сегодня")}</span>
				</div>
				<div className='class-mini__avatars'>
					{["А", "Д", "М", "С"].map((initial) => (
						<i key={initial}>{initial}</i>
					))}
					<b>+20</b>
				</div>
				<div className='class-mini__activity'>
					<span>{t("Выполнили задания")}</span>
					<strong>18 / 24</strong>
				</div>
				<div className='class-mini__progress'>
					<i />
				</div>
			</div>
		</MiniBrowser>
	)
}

function FloatingLibrary() {
	const { t } = useI18n()
	return (
		<MiniBrowser
			title={t("Библиотека материалов")}
			initials='ЖТ'
			accent='orange'
			className='float-card float-card--library'
		>
			<div className='library-mini'>
				<div className='library-mini__tabs'>
					<span className='is-active'>{t("Уроки")}</span>
					<span>{t("Тесты")}</span>
					<span>{t("Слайды")}</span>
				</div>
				<div className='library-mini__items'>
					<div>
						<i />
						<span>
							<strong>{t("Строение клетки")}</strong>
							<small>{t("Биология · 7 класс")}</small>
						</span>
					</div>
					<div>
						<i />
						<span>
							<strong>{t("Линейные функции")}</strong>
							<small>{t("Алгебра · 8 класс")}</small>
						</span>
					</div>
				</div>
			</div>
		</MiniBrowser>
	)
}

function Hero({ onWaitlistOpen }) {
	const { t } = useI18n()
	return (
		<header className='hero' id='top'>
			<Navigation />
			<div className='hero-stage'>
				<FloatingCombinedEventsLesson />
				<FloatingPlan />
				<FloatingLibrary />
				<FloatingChemistryLesson />
				<FloatingClass />
				<FloatingTest />
				<div className='hero-copy' data-reveal>
					<div className='eyebrow'>
						<span className='eyebrow__accent'>{t("Скоро!")}</span>
						<span>{t("Платформа в разработке")}</span>
					</div>
					<h1>
						<span>{t("Единое пространство")}</span>{" "}
						{t("для современного учебного процесса")}
					</h1>
					<p>
						{t(
							"Планируйте по программе, создавайте уроки и тесты вместе с ИИ, ведите классы — Bilim AI связывает весь учебный процесс в одном месте",
						)}
					</p>
					<div className='hero-copy__actions'>
						<WaitlistButton
							className='button--primary'
							onClick={onWaitlistOpen}
						/>
						<a
							className='button button--hero-secondary'
							href='#product'
						>
							{t("Посмотреть возможности")}
						</a>
					</div>
				</div>
			</div>
		</header>
	)
}

const PARTNERS = [
	{ name: "NURORDA", logo: nurordaPartnerLogo, width: "190px" },
	{ name: "SDU University", logo: sduPartnerLogo, width: "64px" },
	{ name: "Білім-Инновация", logo: bifPartnerLogo, width: "180px" },
	{
		name: "Spectrum International School",
		logo: spectrumPartnerLogo,
		width: "216px",
	},
	{ name: "SDL School", logo: sdlPartnerLogo, width: "198px" },
	{ name: "Bilim Innovation Lyceum", logo: bilPartnerLogo, width: "64px" },
]

function PartnerGroup({ duplicate = false }) {
	return (
		<div
			className={`partner-marquee__group${duplicate ? " partner-marquee__group--duplicate" : ""}`}
			aria-hidden={duplicate ? "true" : undefined}
			role={duplicate ? undefined : "list"}
		>
			{PARTNERS.map((partner) => (
				<div
					className='partner-marquee__item'
					style={{ "--partner-width": partner.width }}
					role={duplicate ? undefined : "listitem"}
					key={partner.name}
				>
					<img
						src={partner.logo}
						alt={duplicate ? "" : partner.name}
					/>
				</div>
			))}
		</div>
	)
}

function PartnerMarquee() {
	const { t } = useI18n()
	return (
		<section
			className='partner-marquee section-pad'
			aria-label={t("Партнёры Bilim AI")}
		>
			<div className='partner-marquee__viewport'>
				<div className='partner-marquee__track'>
					<PartnerGroup />
					<PartnerGroup duplicate />
				</div>
			</div>
		</section>
	)
}

function CardPlanVisual() {
	return (
		<div className='workflow-visual workflow-visual--plan'>
			<div className='workflow-plan__head'>
				<span>Физика · 8 класс</span>
				<b>2026 / 27</b>
			</div>
			<div className='workflow-plan__body'>
				<div className='workflow-plan__quarters'>
					<i className='is-active'>I</i>
					<i>II</i>
					<i>III</i>
					<i>IV</i>
				</div>
				<div className='workflow-plan__lines'>
					{[
						"Тепловые явления",
						"Электрический ток",
						"Закон Ома",
						"Работа и мощность",
					].map((item, index) => (
						<div
							key={item}
							className={index === 2 ? "is-selected" : ""}
						>
							<span>{String(index + 1).padStart(2, "0")}</span>
							<b>{item}</b>
							<small>
								{index === 2 ? "Создать урок" : "Готово"}
							</small>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

function CardLessonVisual() {
	return (
		<div className='workflow-visual workflow-visual--lesson'>
			<div className='lesson-canvas'>
				<span className='lesson-canvas__tag'>8 класс · Физика</span>
				<h4>Электрический ток</h4>
				<div className='lesson-canvas__diagram'>
					<span className='atom atom--one' />
					<span className='atom atom--two' />
					<span className='atom atom--three' />
					<i className='flow-line flow-line--one' />
					<i className='flow-line flow-line--two' />
				</div>
				<div className='lesson-canvas__footer'>
					<CirclePlay size={18} fill='currentColor' /> Интерактивное
					объяснение
				</div>
			</div>
			<div className='ai-bubble'>
				<Sparkles size={15} />
				<span>Добавить практический пример?</span>
				<button type='button'>Добавить</button>
			</div>
		</div>
	)
}

function CardCheckVisual() {
	return (
		<div className='workflow-visual workflow-visual--check'>
			<div className='paper-sheet'>
				<span className='scan-beam' />
				<div className='paper-sheet__head'>
					<b>СОР №3</b>
					<small>Алгебра · 7 класс</small>
				</div>
				{["A", "C", "B", "D"].map((answer, index) => (
					<div className='paper-answer' key={`${answer}-${index}`}>
						<span>{index + 1}</span>
						<i>{answer}</i>
						<Check size={12} />
					</div>
				))}
			</div>
			<div className='check-score'>
				<ScanLine size={19} />
				<span>
					<small>Распознано</small>
					<b>8 / 10</b>
				</span>
			</div>
		</div>
	)
}

const WORKFLOW_ITEMS = [
	{
		number: "01",
		kicker: "Спланировать",
		title: "Программа превращается в понятный маршрут",
		body: "Выберите предмет, класс и тему. Цели обучения и структура четверти уже на месте.",
		visual: <CardPlanVisual />,
	},
	{
		number: "02",
		kicker: "Создать",
		title: "AI собирает урок, вы задаёте направление",
		body: "Получите сценарий, слайды, задания и визуалы — затем свободно отредактируйте результат.",
		visual: <CardLessonVisual />,
	},
	{
		number: "03",
		kicker: "Проверить",
		title: "От теста до разбора ошибок без рутины",
		body: "Проведите оценивание онлайн или загрузите фото ответов. Баллы и аналитика появятся сами.",
		visual: <CardCheckVisual />,
	},
]

function WorkflowCards() {
	return (
		<section
			className='workflow-cards'
			id='workflow'
			aria-label='Три этапа работы'
		>
			{WORKFLOW_ITEMS.map((item, index) => (
				<article
					className='workflow-card'
					key={item.number}
					data-reveal
					style={{ "--delay": `${index * 90}ms` }}
				>
					<div className='workflow-card__content'>
						<div className='workflow-card__kicker'>
							<span>{item.number}</span>
							{item.kicker}
						</div>
						<h2>{item.title}</h2>
						<p>{item.body}</p>
					</div>
					{item.visual}
				</article>
			))}
		</section>
	)
}

const PLATFORM_PILLARS = [
	{
		id: "plan",
		title: "Планируйте целостно",
		body: "Связывайте учебную программу, цели, четверти и отдельные уроки в один маршрут, который всегда остаётся перед глазами.",
	},
	{
		id: "create",
		title: "Создавайте вместе с AI",
		body: "Начинайте с идеи и получайте основу урока, теста или презентации. Затем свободно меняйте результат под себя и свой класс.",
	},
	{
		id: "understand",
		title: "Понимайте результат",
		body: "Превращайте ответы учеников в ясную картину: что уже усвоено, где возникли сложности и чему уделить внимание дальше.",
	},
]

function PlatformPillarVisual({ type }) {
	return (
		<div className={`platform-visual platform-visual--${type}`}>
			<div className='platform-ui-frame'>
				{type === "plan" ? (
					<BilimPlanUI />
				) : (
					<BilimEditorUI question={type === "understand"} />
				)}
			</div>
		</div>
	)
}

function PlatformOverview() {
	const { t } = useI18n()
	return (
		<section
			className='platform-overview section-pad'
			id='product'
			aria-label={t("Возможности Bilim AI")}
		>
			<div className='platform-pillars'>
				{PLATFORM_PILLARS.map((pillar, index) => (
					<article
						className='platform-pillar'
						data-reveal
						style={{ "--delay": `${index * 90}ms` }}
						key={pillar.id}
					>
						<PlatformPillarVisual type={pillar.id} />
						<h3>{t(pillar.title)}</h3>
						<p>{t(pillar.body)}</p>
					</article>
				))}
			</div>
		</section>
	)
}

function ProductStrip() {
	const items = [
		[CalendarDays, "Учебные программы"],
		[SquarePen, "AI‑уроки"],
		[ClipboardCheck, "Тесты и экзамены"],
		[School, "Классы"],
		[Library, "Галерея материалов"],
	]
	return (
		<section className='product-strip section-pad' data-reveal>
			<p>Одна система вместо набора разрозненных инструментов</p>
			<div className='product-strip__items'>
				{items.map(([Icon, text]) => (
					<span key={text}>
						<Icon size={21} />
						{text}
					</span>
				))}
			</div>
		</section>
	)
}

function Benefit({ icon: Icon, title, children }) {
	return (
		<div className='benefit'>
			<Icon size={18} />
			<div>
				<h4>{title}</h4>
				<p>{children}</p>
			</div>
		</div>
	)
}

function SyllabusVisual() {
	return (
		<div className='product-window product-window--real-ui'>
			<BilimPlanUI />
		</div>
	)
}

function EditorVisual() {
	return (
		<div className='product-window product-window--real-ui'>
			<BilimEditorUI />
		</div>
	)
}

function AssessmentVisual() {
	return (
		<div className='product-window product-window--real-ui'>
			<BilimEditorUI question />
		</div>
	)
}

const FEATURES = [
	{
		id: "programs",
		number: "01",
		label: "Программа → план",
		title: "Весь учебный год виден как на ладони",
		body: "Bilim AI раскладывает программу по четвертям, разделам и темам. Цели обучения, календарное планирование и материалы остаются связанными между собой.",
		benefits: [
			[
				CalendarDays,
				"Планирование без таблиц",
				"ҰМЖ, ОМЖ, КТЖ и ҚМЖ находятся в одной логике.",
			],
			[
				Clock3,
				"Всегда понятно, что дальше",
				"Откройте тему и продолжите с того места, где остановились.",
			],
		],
		visual: <SyllabusVisual />,
	},
	{
		id: "lessons",
		number: "02",
		label: "Идея → урок",
		title: "AI создаёт основу. Вы сохраняете авторство.",
		body: "Опишите тему обычными словами — и получите структурированный урок со слайдами, объяснениями, заданиями и визуалами. Всё можно менять вручную или вместе с AI.",
		benefits: [
			[
				Sparkles,
				"Не шаблон, а ваш сценарий",
				"Учитываются класс, язык, тип урока и учебная цель.",
			],
			[
				SquarePen,
				"Полноценный редактор",
				"Меняйте текст, композицию и порядок слайдов без ограничений.",
			],
		],
		visual: <EditorVisual />,
	},
	{
		id: "assessment",
		number: "03",
		label: "Ответы → понимание",
		title: "Проверка заканчивается выводами, а не стопкой работ",
		body: "Создавайте СОР, СОЧ и экзамены с разными типами вопросов. Bilim AI проверит онлайн-ответы или фотографии бумажных работ и покажет, где классу нужна помощь.",
		benefits: [
			[
				ScanLine,
				"Бумага тоже работает",
				"Загрузите фото листа — ответы распознаются автоматически.",
			],
			[
				TestTube2,
				"Аналитика по каждому вопросу",
				"Средний балл, сложные темы и прогресс учеников видны сразу.",
			],
		],
		visual: <AssessmentVisual />,
	},
]

function FeatureSection({ feature, index }) {
	return (
		<article
			className={`feature-section ${index % 2 ? "feature-section--reverse" : ""}`}
			id={index === 0 ? "product" : undefined}
		>
			<div className='feature-section__copy' data-reveal>
				<div className='section-kicker'>
					<span>{feature.number}</span>
					{feature.label}
				</div>
				<h3>{feature.title}</h3>
				<p className='feature-section__lead'>{feature.body}</p>
				<div className='benefits'>
					{feature.benefits.map(([Icon, title, body]) => (
						<Benefit icon={Icon} title={title} key={title}>
							{body}
						</Benefit>
					))}
				</div>
			</div>
			<div
				className='feature-section__visual'
				data-reveal
				style={{ "--delay": "120ms" }}
			>
				{feature.visual}
			</div>
		</article>
	)
}

function ConnectedClassVisual() {
	return (
		<div className='connected-visual'>
			<div className='connected-visual__lesson'>
				<div className='connected-visual__top'>
					<span>Урок 12</span>
					<small>Открыт классу</small>
				</div>
				<h4>Закон сохранения энергии</h4>
				<div className='connected-visual__image'>
					<i />
					<i />
					<i />
					<span>E = const</span>
				</div>
				<div className='connected-visual__people'>
					<span>АК</span>
					<span>ДТ</span>
					<span>МА</span>
					<span>+21</span>
				</div>
			</div>
			<div className='connection-line'>
				<i />
			</div>
			<div className='connected-visual__class'>
				<School size={18} />
				<div>
					<small>9 «Б» класс</small>
					<b>24 ученика</b>
				</div>
				<CheckCircle2 size={18} />
			</div>
		</div>
	)
}

function MarketplaceVisual() {
	const cards = [
		["#dff3ed", "Биология", "Строение клетки"],
		["#dff4f6", "Математика", "Квадратные функции"],
		["#edf0ec", "История", "Великий шёлковый путь"],
	]
	return (
		<div className='market-visual'>
			<div className='market-search'>
				<span>
					<Library size={15} /> Галерея материалов
				</span>
				<small>Поиск</small>
			</div>
			<div className='market-cards'>
				{cards.map(([color, subject, title], index) => (
					<div key={title} style={{ "--card-color": color }}>
						<span>{subject}</span>
						<i
							className={`market-shape market-shape--${index + 1}`}
						/>
						<strong>{title}</strong>
						<small>{index + 7} класс · 12 слайдов</small>
					</div>
				))}
			</div>
		</div>
	)
}

const TEACHER_PERSONA = { name: "преподаватели" }

const TEACHER_FEATURES = [
	{
		id: "authorship",
		number: "01",
		overline: "Авторство",
		title: "ИИ готовит основу. Методика остаётся вашей",
		description:
			"Bilim AI не запирает преподавателя в готовом шаблоне. Меняйте структуру, формулировки, визуалы и задания вручную или точечными командами — итоговый урок остаётся вашим.",
		details: [
			"Полноценное редактирование каждого блока",
			"AI помогает, но не принимает методические решения за вас",
		],
		visual: "lesson",
	},
	{
		id: "curriculum",
		number: "02",
		overline: "Программа Казахстана",
		title: "Учебные стандарты уже встроены в рабочий процесс",
		description:
			"Цели обучения, четверти и форматы планирования не приходится переносить между документами вручную. Bilim AI связывает требования программы с темами и материалами урока.",
		details: [
			"ҰМЖ, ОМЖ, КТЖ и ҚМЖ в единой логике",
			"Цели обучения остаются связанными с каждым материалом",
		],
		visual: "plan",
	},
	{
		id: "paper-and-digital",
		number: "03",
		overline: "Без смены привычного формата",
		title: "Бумажные и онлайн-работы дают одну картину класса",
		description:
			"Проводите тест в системе или оставьте ученикам привычные листы. Bilim AI распознаёт фотографии ответов и объединяет результаты в общей аналитике.",
		details: [
			"Распознавание бумажных работ по фото",
			"Единая аналитика независимо от формата ответа",
		],
		visual: "results",
	},
	{
		id: "languages-and-library",
		number: "04",
		overline: "Язык и обмен",
		title: "Одна библиотека для разных классов, языков и преподавателей",
		description:
			"Создавайте и адаптируйте материалы на казахском, русском и английском. Сохраняйте сильные наработки в личной или школьной библиотеке и делитесь ими с коллегами.",
		details: [
			"Казахский, русский и английский",
			"Личная и общая библиотека материалов",
		],
		visual: "library",
	},
]

function PersonaMarketplaceVisual() {
	const lessons = MARKETPLACE_LESSONS.slice(0, 6)
	const rows = [lessons.slice(0, 3), lessons.slice(3)]

	return (
		<div className='persona-marketplace'>
			<div className='persona-marketplace__deck'>
				{rows.map((row, rowIndex) => (
					<div className='persona-marketplace__row' key={rowIndex}>
						{row.map((lesson) => (
							<div
								className='persona-marketplace__card'
								key={lesson.id}
							>
								<MarketplaceLessonCard lesson={lesson} />
							</div>
						))}
					</div>
				))}
			</div>
		</div>
	)
}

function PersonaWorkspace({ visual }) {
	return (
		<div
			className={`persona-product persona-product--${visual} persona-product--real-ui`}
		>
			{visual === "lesson" ? (
				<BilimEditorUI />
			) : visual === "plan" ? (
				<BilimPlanUI />
			) : visual === "results" ? (
				<BilimEditorUI question />
			) : (
				<PersonaMarketplaceVisual />
			)}
		</div>
	)
}

function PersonaSection() {
	const [featureIndex, setFeatureIndex] = useState(0)
	const { t } = useI18n()
	const featureRefs = useRef([])
	const activeFeature = TEACHER_FEATURES[featureIndex]

	useEffect(() => {
		let frame = 0

		const updateActiveFeature = () => {
			window.cancelAnimationFrame(frame)
			frame = window.requestAnimationFrame(() => {
				const activationLine = window.innerHeight * 0.46
				let nextIndex = 0

				featureRefs.current.forEach((node, index) => {
					if (
						node &&
						node.getBoundingClientRect().top <= activationLine
					)
						nextIndex = index
				})

				setFeatureIndex((current) =>
					current === nextIndex ? current : nextIndex,
				)
			})
		}

		updateActiveFeature()
		window.addEventListener("scroll", updateActiveFeature, {
			passive: true,
		})
		window.addEventListener("resize", updateActiveFeature)

		return () => {
			window.cancelAnimationFrame(frame)
			window.removeEventListener("scroll", updateActiveFeature)
			window.removeEventListener("resize", updateActiveFeature)
		}
	}, [])

	return (
		<section className='persona section-pad' id='workflow'>
			<div className='persona__heading' id='classes' data-reveal>
				<h2>
					<span>{t("От идеи")}</span>{" "}
					{t("до готового урока за минуты")}
				</h2>
				<p>
					{t(
						"Bilim AI ведёт преподавателя по всему процессу: помогает спланировать работу, собрать материал и увидеть, что действительно усвоил класс.",
					)}
				</p>
			</div>

			<div className='persona-scroll'>
				<div className='persona-story'>
					{TEACHER_FEATURES.map((feature, index) => (
						<article
							className={`persona-story__item ${featureIndex === index ? "is-active" : ""}`}
							ref={(node) => {
								featureRefs.current[index] = node
							}}
							key={feature.id}
						>
							<h3>{t(feature.title)}</h3>
							<p>{t(feature.description)}</p>
							<ul>
								{feature.details.map((detail) => (
									<li key={detail}>
										<Check size={15} />
										{t(detail)}
									</li>
								))}
							</ul>
							<div className='persona-story__mobile-preview'>
								<div
									className={`persona__preview persona__preview--${feature.id}`}
								>
									<PersonaWorkspace
										visual={feature.visual}
										persona={TEACHER_PERSONA}
									/>
								</div>
							</div>
						</article>
					))}
				</div>

				<aside className='persona-sticky' aria-live='polite'>
					<div
						className={`persona__preview persona__preview--${activeFeature.id}`}
					>
						<div
							className='persona-sticky__stage'
							key={activeFeature.id}
						>
							<PersonaWorkspace
								visual={activeFeature.visual}
								persona={TEACHER_PERSONA}
							/>
						</div>
						<div className='persona-sticky__progress'>
							<span>{activeFeature.number}</span>
							<i>
								<b
									style={{
										"--progress": `${((featureIndex + 1) / TEACHER_FEATURES.length) * 100}%`,
									}}
								/>
							</i>
							<small>04</small>
						</div>
					</div>
				</aside>
			</div>
		</section>
	)
}

function SecondaryFeatures() {
	return <PersonaSection />
}

const FAQ_ITEMS = [
	[
		"Что такое BilimAI?",
		"BilimAI — это платформа на базе ИИ, которая помогает создавать структурированные уроки по любой теме и даёт ученикам умные инструменты для обучения.",
	],
	[
		"BilimAI заменяет учителей?",
		"Нет. BilimAI сокращает время на подготовку, чтобы учителя могли сосредоточиться на главном — преподавании и работе с учениками.",
	],
	[
		"Можно ли создавать уроки вне учебной программы?",
		"Да. Учителя могут создавать уроки как по темам официальной программы, так и по любым своим темам.",
	],
	[
		"Что входит в урок, созданный ИИ?",
		"Каждый урок включает объяснения, примеры, упражнения и задания для проверки знаний — всё в чёткой и последовательной структуре.",
	],
	[
		"Могут ли учителя делиться уроками?",
		"Да. В BilimAI есть маркетплейс, где учителя могут делиться уроками, находить материалы других авторов и адаптировать их под свои нужды.",
	],
	[
		"Платформа уже доступна?",
		"BilimAI сейчас в разработке и скоро будет запущена.",
	],
]

function FAQ() {
	const { t } = useI18n()
	return (
		<section className='faq section-pad' id='faq'>
			<div className='faq__intro' data-reveal>
				<h2>{t("Остались вопросы?")}</h2>
			</div>
			<div
				className='faq__list'
				data-reveal
				style={{ "--delay": "100ms" }}
			>
				{FAQ_ITEMS.map(([question, answer], index) => (
					<details key={question} open={index === 0}>
						<summary>
							<span>{t(question)}</span>
							<ChevronDown size={20} />
						</summary>
						<p>{t(answer)}</p>
					</details>
				))}
			</div>
		</section>
	)
}

const MARKETPLACE_LESSONS = [
	{
		id: "854501e3-220a-46a8-99a9-ddf8dec2da1c",
		title: "Митоз: Бір жасуша екіге айналады",
		subject: "Биология",
		topic: "Адаптация",
		grade: "8 класс",
		image: mitosisCover,
		layout: "split",
		accent: "#4b43e0",
	},
	{
		id: "0052be7a-bc22-4871-87fd-342cb695ddcd",
		slug: "geometric-sequences",
		title: "Geometric Sequences",
		subject: "Математика",
		topic: "Последовательности",
		grade: "9 класс",
		image: geometricSequencesCover,
		layout: "split",
		accent: "#3367d6",
	},
	{
		id: "f9c2ffb0-08ae-40eb-9a12-419b54b3d303",
		slug: "chemical-kinetics",
		title: "Chemical Kinetics",
		subject: "Химия",
		topic: "Химическая кинетика",
		grade: "11 класс",
		image: chemicalKineticsCover,
		layout: "split",
		accent: "#059b8a",
	},
	{
		id: "15d5b61a-c3cb-4a02-8227-766298cdc1a6",
		slug: "kazakhstan-in-world-war-ii",
		title: "Kazakhstan in World War II",
		subject: "История",
		topic: "Казахстан в XX веке",
		grade: "10 класс",
		image: kazakhstanWwiiCover,
		layout: "cover",
		accent: "#d28a28",
	},
	{
		id: "28f612c9-3407-49dc-aeb2-9528398a1a59",
		slug: "determination-of-distance-in-astronomy-by-method-of-parallax",
		title: "Измерение расстояний параллаксом",
		subject: "Физика",
		topic: "Основы астрономии",
		grade: "9 класс",
		image: parallaxCover,
		layout: "cover",
		accent: "#7368e7",
	},
	{
		id: "b7604897-2203-46ff-b583-28cb9632ecb2",
		slug: "photosynthesis",
		title: "Photosynthesis",
		subject: "Биология",
		topic: "Фотосинтез",
		grade: "7 класс",
		image: photosynthesisCover,
		layout: "split",
		accent: "#2d9a57",
	},
	{
		id: "b25ac1f8-cd7c-42c1-a739-4cb0409c606f",
		slug: "combined-events",
		title: "Combined Events",
		subject: "Математика",
		topic: "Вероятность",
		grade: "9 класс",
		image: combinedEventsCover,
		layout: "split",
		accent: "#3367d6",
	},
	{
		id: "60a08953-2b41-4518-adc5-be370d4498f8",
		slug: "independence-of-kazakhstan",
		title: "Independence of Kazakhstan",
		subject: "История",
		topic: "Независимый Казахстан",
		grade: "11 класс",
		image: independenceKazakhstanCover,
		layout: "split",
		accent: "#d28a28",
	},
	{
		id: "47aaeef3-9240-4f54-8ac2-f2a804867dd2",
		slug: "carbon-and-silicon",
		title: "Carbon and Silicon",
		subject: "Химия",
		topic: "Углерод и кремний",
		grade: "9 класс",
		image: carbonSiliconCover,
		layout: "split",
		accent: "#059b8a",
	},
	{
		id: "a9758ab5-088f-4d35-9203-a3ad0c0dc836",
		slug: "electromagnetic-oscillations",
		title: "LC Oscillations: Energy Exchange",
		subject: "Physics",
		topic: "Oscillations and waves",
		grade: "Grade 11",
		image: lcOscillationsCover,
		layout: "cover",
		accent: "#6e64e2",
	},
	{
		id: "d328b6eb-12ab-4cda-a8b4-22f3bd926376",
		slug: "graphing-lines",
		title: "Graphing Lines",
		subject: "Математика",
		topic: "Линейные функции",
		grade: "8 класс",
		image: graphingLinesCover,
		layout: "cover",
		accent: "#3367d6",
	},
	{
		id: "8db682c2-b893-4b36-9504-2d3ddbac92e2",
		slug: "diversity-of-animals",
		title: "Diversity of Animals",
		subject: "Биология",
		topic: "Разнообразие животных",
		grade: "8 класс",
		image: diversityAnimalsCover,
		layout: "split",
		accent: "#2d9a57",
	},
]

function MarketplaceLessonCard({ lesson, duplicate = false, linked = true }) {
	const { t } = useI18n()
	const Card = linked ? "a" : "div"
	const translatedTitle = t(lesson.title)

	return (
		<Card
			className={`marketplace-lesson-card marketplace-lesson-card--${lesson.layout}`}
			href={
				linked
					? appUrl(`/marketplace/lesson/${lesson.slug || lesson.id}`)
					: undefined
			}
			style={{ "--lesson-accent": lesson.accent }}
			aria-hidden={duplicate ? "true" : undefined}
			tabIndex={linked && duplicate ? -1 : undefined}
		>
			<div className='marketplace-lesson-card__preview'>
				<img src={lesson.image} alt='' loading='lazy' />
				<div className='marketplace-lesson-card__shade' />
				<div className='marketplace-lesson-card__copy'>
					<small>{t(lesson.subject)}</small>
					<strong
						style={
							translatedTitle === "Комбинированные события"
								? { fontSize: "12px" }
								: undefined
						}
					>
						{translatedTitle}
					</strong>
					{lesson.layout === "split" ? <i /> : null}
				</div>
			</div>
		</Card>
	)
}

function MarketplaceRibbonGroup({ lessons, duplicate = false }) {
	return (
		<div
			className='marketplace-ribbon__group'
			aria-hidden={duplicate ? "true" : undefined}
			role={duplicate ? undefined : "list"}
		>
			{lessons.map((lesson) => (
				<MarketplaceLessonCard
					lesson={lesson}
					duplicate={duplicate}
					linked={false}
					key={lesson.id}
				/>
			))}
		</div>
	)
}

function MarketplaceRibbon({ lessons, reverse = false }) {
	return (
		<div
			className={`marketplace-ribbon ${reverse ? "marketplace-ribbon--reverse" : ""}`}
		>
			<div className='marketplace-ribbon__track'>
				<MarketplaceRibbonGroup lessons={lessons} />
				<MarketplaceRibbonGroup lessons={lessons} duplicate />
			</div>
		</div>
	)
}

function FinalCta({ onWaitlistOpen }) {
	const { t } = useI18n()
	return (
		<section className='competitive' data-reveal>
			<div className='competitive__diffusion' aria-hidden='true' />
			<div className='competitive__inner section-pad'>
				<div className='competitive__copy'>
					<h2>{t("Сделайте каждый урок сильнее")}</h2>
					<p>
						{t(
							"От первой идеи до результата класса — Bilim AI помогает превращать время преподавателя в качественное обучение.",
						)}
					</p>
					<div className='competitive__actions'>
						<WaitlistButton
							className='button--white'
							onClick={onWaitlistOpen}
						/>
					</div>
				</div>
			</div>
			<div
				className='marketplace-ribbons'
				aria-label={t("Уроки из маркетплейса Bilim AI")}
			>
				<MarketplaceRibbon lessons={MARKETPLACE_LESSONS.slice(0, 6)} />
				<MarketplaceRibbon
					lessons={MARKETPLACE_LESSONS.slice(6)}
					reverse
				/>
			</div>
		</section>
	)
}

function Footer({ copyrightYear }) {
	const { t } = useI18n()
	return (
		<footer className='footer section-pad'>
			<div className='footer__top'>
				<div className='footer__brand'>
					<Logo />
					<p>{t("AI‑пространство для школы, где всё связано.")}</p>
				</div>
				<div className='footer__links'>
					<div>
						<strong>{t("Продукт")}</strong>
						<a href='#product'>{t("Возможности")}</a>
						<a href='#workflow'>{t("Как работает")}</a>
						<a href='#classes'>{t("Для классов")}</a>
						<a href='#faq'>{t("Частые вопросы")}</a>
					</div>
				</div>
			</div>
			<div className='footer__bottom'>
				<span>© {copyrightYear} Bilim AI</span>
			</div>
		</footer>
	)
}

function useReveal() {
	useEffect(() => {
		const nodes = document.querySelectorAll("[data-reveal]")
		const reduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches
		if (reduced) {
			nodes.forEach((node) => node.classList.add("is-visible"))
			return undefined
		}
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add("is-visible")
						observer.unobserve(entry.target)
					}
				})
			},
			{ threshold: 0.12, rootMargin: "0px 0px -40px" },
		)
		nodes.forEach((node) => observer.observe(node))
		return () => observer.disconnect()
	}, [])
}

export default function App({ copyrightYear }) {
	const [waitlistOpen, setWaitlistOpen] = useState(false)
	const language = useStoredLanguage()
	useReveal()

	useEffect(() => {
		document.documentElement.lang = language
		document.title =
			language === "kk"
				? "Bilim AI — сабақтар, тесттер және сыныптар бір кеңістікте"
				: language === "en"
					? "Bilim AI — lessons, tests, and classes in one space"
					: "Bilim AI — уроки, тесты и классы в одном пространстве"
	}, [language])

	const i18n = {
		language,
		setLanguage: setStoredLanguage,
		t: (source, variables) => translate(language, source, variables),
	}

	return (
		<LanguageContext.Provider value={i18n}>
			<Hero onWaitlistOpen={() => setWaitlistOpen(true)} />
			<main>
				<PlatformOverview />
				<PartnerMarquee />
				<SecondaryFeatures />
				<FAQ />
				<FinalCta onWaitlistOpen={() => setWaitlistOpen(true)} />
			</main>
			<Footer copyrightYear={copyrightYear} />
			{waitlistOpen ? (
				<WaitlistModal open onClose={() => setWaitlistOpen(false)} />
			) : null}
		</LanguageContext.Provider>
	)
}
