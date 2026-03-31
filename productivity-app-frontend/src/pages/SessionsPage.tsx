import { useEffect, useState } from "react";
import { getSessions, startSession, stopSession, getRunningSession, getHistory, getTodayMinutes } from "../api/FocusSesstionsApi"
import type { FocusSession } from "../types/FocusSession";
import { focusTypeMap, focusTypes } from "../constants/FocusTypes";

export default function SessionPage() {
    const [_sessions, setSessions] = useState<FocusSession[]>([])
    const [historySessions, setHistorySessions] = useState<FocusSession[]>([])
    const [isRunning, setIsRunning] = useState(false)
    const [sessionId, setSessionId] = useState<number | null>(null)
    const [duration, setDuration] = useState(15)
    const [secondsLeft, setSecondsLeft] = useState(0)
    const [typeId, setTypeId] = useState("01")
    const [todayMinutes, setTodayMinutes] = useState(0)
    const [historyStart, setHistoryStart] = useState<string>("")
    const [historyEnd, setHistoryEnd] = useState<string>("")
    const [historyType, setHistoryType] = useState<string>("")
    const [justFinished, setJustFinished] = useState(false)
    const [finishType, setFinishType] = useState<"completed" | "stopped" | null>(null)
    const [startTime, setStartTime] = useState<string | null>(null)

    useEffect(() => {
        loadSessions()
        checkRunning()
    }, [])

    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (!document.hidden && isRunning) {
                try {
                    const session = await getRunningSession()
                    if (!session) return

                    setStartTime(session.startTime)
                } catch { }
            }
        }

        document.addEventListener("visibilitychange", handleVisibilityChange)
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
    }, [isRunning])

    useEffect(() => {
        if (!isRunning) {
            setSecondsLeft(duration * 60)
        }
    }, [duration])

    useEffect(() => {
        if (!isRunning || !startTime) return

        const timer = setInterval(() => {
            const start = new Date(startTime).getTime()
            const now = Date.now()

            const total = duration * 60
            const elapsed = Math.floor((now - start) / 1000)

            const left = Math.max(total - elapsed, 0)

            setSecondsLeft(left)

            if (left <= 0) {
                setFinishType("completed")
                handleStop()
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [isRunning, startTime, duration])

    const loadSessions = async () => {
        try {
            const data = await getSessions()
            setSessions(data)

            const today = await getTodayMinutes()
            setTodayMinutes(today)
        } catch (err: any) {
            console.error(err)
            alert(err.response?.data || "Failed to load sessions")
        }
    }

    const loadHistory = async () => {
        try {
            const data = await getHistory(historyStart, historyEnd, historyType)
            setHistorySessions(data)
        } catch (err: any) {
            console.log(err.response?.data)
            alert(err.response?.data || "Something went wrong")
        }
    }

    const checkRunning = async () => {
        try {
            const session = await getRunningSession()
            if (!session) return

            setSessionId(session.id)
            setIsRunning(true)
            setDuration(session.plannedMinutes)
            setStartTime(session.startTime)

            const start = new Date(session.startTime).getTime()
            const now = Date.now()
            const elapsed = Math.floor((now - start) / 1000)
            const total = session.plannedMinutes * 60
            setSecondsLeft(Math.max(total - elapsed, 0))
            setTypeId(session.typeId);
        } catch {/* no running session */ }
    }

    const handleStart = async () => {
        try {
            const session = await startSession(duration, typeId)
            setFinishType(null)
            setSessionId(session.id)
            setIsRunning(true)

            setStartTime(session.startTime)
            setSecondsLeft(duration * 60)
        } catch {
            alert("A focus session is already running.")
        }
    }

    const handleStopClick = () => {
        setFinishType("stopped")
        handleStop()
    }

    const handleStop = async () => {
        if (!isRunning || !sessionId) return

        try {
            await stopSession(sessionId)

            setIsRunning(false)
            setJustFinished(true)

            setTimeout(() => setJustFinished(false), 3000)

            loadSessions()
            loadHistory()
        } catch (err: any) {
            console.error(err)
            alert(err.response?.data || "Failed to stop session")
        }
    }

    const pulseStyle = {
        animation: isRunning ? "pulse 1.5s infinite" : "none"
    }

    const progress = duration ? secondsLeft / (duration * 60) : 0

    const Pet = ({ isRunning, justFinished }: { isRunning: boolean, justFinished: boolean }) => {
        return (
            <div style={{
                marginTop: "20px",
                display: "flex",
                justifyContent: "center"
            }}>
                <div style={{
                    fontSize: "48px",
                    animation: justFinished
                        ? "petJump 0.6s ease"
                        : isRunning
                            ? "petBreathFast 1.2s ease-in-out infinite"
                            : "petBreathSlow 2.5s ease-in-out infinite"
                }}>
                    🐈‍⬛
                </div>
            </div>
        )
    }

    return (
        <div style={{
            maxWidth: "720px",
            margin: "40px auto",
            padding: "0 12px"
        }}>
            <div style={{
                minHeight: "100vh",
                background: "linear-gradient(180deg, #E8F5E9 0%, #FDFDFD 100%)",
                padding: "40px 16px",
                fontFamily: "system-ui, -apple-system, sans-serif"
            }}>
                <div style={{
                    maxWidth: "720px",
                    margin: "0 auto"
                }}>
                    <style>
                        {`
                        @keyframes petBreathSlow {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                        100% { transform: scale(1); }
                        }

                        @keyframes petBreathFast {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.08); }
                        100% { transform: scale(1); }
                        }

                        @keyframes petJump {
                        0% { transform: translateY(0); }
                        30% { transform: translateY(-10px); }
                        60% { transform: translateY(0); }
                        100% { transform: translateY(0); }
                        }
                        `}
                    </style>
                    <h1 style={{
                        textAlign: "center",
                        fontSize: "clamp(20px, 6vw, 32px)",
                        marginBottom: "6px"
                    }}>Focus Timer</h1>
                    <p style={{ textAlign: "center", color: "#64748b", marginBottom: "30px" }}>Stay focused. Stay sharp.</p>

                    {/* --- Clock + Time Buttons --- */}
                    <div style={{ ...clockContainer, ...pulseStyle }}>
                        <svg width="220" height="220" style={{ position: "absolute" }}>
                            {/* 背景圓 */}
                            <circle
                                cx="110"
                                cy="110"
                                r="100"
                                stroke="#e5e7eb"
                                strokeWidth="8"
                                fill="none"
                            />

                            {/* 進度圓 */}
                            <circle
                                cx="110"
                                cy="110"
                                r="100"
                                stroke="#4CAF50"
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={2 * Math.PI * 100}
                                strokeDashoffset={(1 - progress) * 2 * Math.PI * 100}
                                strokeLinecap="round"
                                style={{
                                    transition: "stroke-dashoffset 1s linear"
                                }}
                            />
                        </svg>
                        <div style={clockCenter}>
                            {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, "0")}
                        </div>

                        {[15, 30, 45, 60].map((min, index) => {
                            const angle = (index / 4) * 2 * Math.PI
                            const size = 200
                            const radius = size * 0.4

                            const x = Math.cos(angle - Math.PI / 2) * radius
                            const y = Math.sin(angle - Math.PI / 2) * radius
                            return (
                                <button
                                    key={min}
                                    onClick={() => setDuration(min)}
                                    disabled={isRunning}
                                    style={{
                                        ...clockButton,
                                        transform: `translate(${x}px, ${y}px)`,
                                        background: duration === min ? "#4CAF50" : "#f1f5f9",
                                        color: duration === min ? "#fff" : "#334155",
                                        boxShadow: duration === min
                                            ? "0 4px 12px rgba(76,175,80,0.4)"
                                            : "0 2px 6px rgba(0,0,0,0.08)",
                                        border: duration === min ? "2px solid #4CAF50" : "1px solid #ccc",
                                    }}
                                    onMouseDown={(e) => e.currentTarget.style.transform += " scale(0.9)"}
                                    onMouseUp={(e) => e.currentTarget.style.transform = `translate(${x}px, ${y}px) scale(1.1)`}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = `translate(${x}px, ${y}px)`}
                                    onMouseEnter={(e) => e.currentTarget.style.transform += " scale(1.1)"}
                                >
                                    {min}
                                </button>
                            )
                        })}
                    </div>
                    <Pet isRunning={isRunning} justFinished={justFinished} />
                    {/* --- Type & Start/Stop Buttons --- */}
                    <div style={responsiveButtonContainer}>
                        <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            類型：
                            <div
                                style={{
                                    background: "#f1f5f9",
                                    padding: "6px 10px",
                                    borderRadius: "10px"
                                }}>
                                <select
                                    value={typeId}
                                    onChange={e => setTypeId(e.target.value)}
                                    disabled={isRunning}
                                    style={selectStyle}
                                >
                                    {focusTypes.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                        </label>

                        {!isRunning ? (
                            <button
                                onClick={handleStart}
                                style={{
                                    ...btnStyle,
                                    //background: "linear-gradient(135deg, #ef4444, #dc2626)",
                                    //boxShadow: "0 6px 16px rgba(239,68,68,0.3)"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                                onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.95)"}
                                onMouseUp={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                            >
                                Start
                            </button>) : (
                            <button
                                onClick={handleStopClick}
                                style={{ ...btnStyle, background: "#FF8A80" }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                                onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.95)"}
                                onMouseUp={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                            >
                                Stop
                            </button>
                        )}
                    </div>
                    {justFinished && (
                        <div style={{
                            ...cardStyle,
                            textAlign: "center",
                            fontWeight: "bold",
                            background: finishType === "completed" ? "#effdec" : "#fff7ed",
                            color: finishType === "completed" ? "#16a34a" : "#ea580c",
                            transform: "translateY(-6px)"
                        }}>
                            {finishType === "completed"
                                ? "🎉 恭喜你完成一次專注"
                                : "⏸️ 先停一下也沒關係"}
                        </div>
                    )}
                    {/* --- Today Card --- */}
                    <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                        <div style={{ ...cardStyle, flex: 1, textAlign: "center" }}>
                            <h3 style={{ color: "#666" }}>Today</h3>
                            <div style={{ fontSize: "clamp(20px, 6vw, 32px)", fontWeight: "bold" }}>{todayMinutes} min</div>
                        </div>
                    </div>

                    {/* --- History Filter --- */}
                    <div style={cardStyle}>
                        <h3 style={{ color: "#666" }}>History</h3>
                        <div style={{ marginBottom: "10px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
                            <label>
                                開始日期：
                                <input type="date" value={historyStart} onChange={e => setHistoryStart(e.target.value)} style={inputStyle} />
                            </label>
                            <label>
                                結束日期：
                                <input type="date" value={historyEnd} onChange={e => setHistoryEnd(e.target.value)} style={inputStyle} />
                            </label>
                            <label>
                                類型：
                                <select value={historyType} onChange={e => setHistoryType(e.target.value)} style={selectStyle}>
                                    <option value="">全部</option>
                                    {focusTypes.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </label>
                            <button
                                onClick={loadHistory}
                                style={{ ...btnStyle, padding: "6px 12px" }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                                onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.95)"}
                                onMouseUp={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                            >
                                查詢
                            </button>
                        </div>

                        {historySessions.length === 0 ? (
                            <div style={{ color: "#888" }}>查無資料</div>
                        ) : (
                            historySessions.map((s) => (
                                <div key={s.id} style={{ padding: "10px", borderRadius: "10px", background: "#fafafa", marginBottom: "8px" }}>
                                    {new Date(s.startTime + "Z").toLocaleString()} - {new Date(s.endTime + "Z").toLocaleString()}<br />
                                    <strong>{s.durationMinutes} min</strong> · {focusTypeMap[s.typeId]}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>

    )
}

const cardStyle = {
    background: "#ffffff",
    padding: "clamp(12px, 4vw, 20px)",
    borderRadius: "20px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
    marginBottom: "20px"
}

const btnStyle = {
    padding: "12px 26px",
    fontSize: "16px",
    borderRadius: "999px",
    border: "none",
    // background: "linear-gradient(135deg, #4CAF50, #43a047)",
    background: "#7FB77E",
    color: "#fff",
    cursor: "pointer",
    transition: "all 0.25s ease",
    boxShadow: "0 6px 15px rgba(127,183,126,0.4)"
}

const inputStyle = {
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s ease",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)"
}

const selectStyle = {
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    background: "#fff",
    cursor: "pointer",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)"
}

const clockContainer = {
    position: "relative" as const,
    width: "clamp(160px, 50vw, 220px)",
    height: "clamp(160px, 50vw, 220px)",
    margin: "20px auto",
    borderRadius: "50%",
    background: "#ffffff",
    boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
}

const clockCenter = {
    position: "absolute" as const,
    fontSize: "clamp(22px, 6vw, 28px)",
    fontWeight: "700",
    color: "#2F3E2F",
    background: "#ffffffcc",
    padding: "10px 16px",
    borderRadius: "20px",
    backdropFilter: "blur(6px)"
}

const clockButton = {
    position: "absolute" as const,
    width: "22%",
    height: "22%",
    borderRadius: "50%",
    cursor: "pointer",
    fontWeight: "bold",
    border: "none",
    background: "#ffffff",
    color: "#334155",
    transition: "all 0.25s ease",
    userSelect: "none" as const,
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
}

const responsiveButtonContainer = {
    display: "flex",
    flexWrap: "wrap" as const,
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
    marginBottom: "30px",
    padding: "0 10px"
}
