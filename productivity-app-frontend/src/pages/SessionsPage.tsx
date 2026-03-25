import { useEffect, useState } from "react";
import { getSessions, startSession, stopSession, getRunningSession, getHistory, getTodayMinutes } from "../api/FocusSesstionsApi"
import type { FocusSession } from "../types/FocusSession";
import { focusTypeMap, focusTypes } from "../constants/FocusTypes";

export default function SessionPage(){
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
                } catch {}
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
        } catch(err: any) {
            console.log(err.response?.data)
            alert(err.response?.data || "Something went wrong")
        }
    }

    const checkRunning = async () => {
        try{
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
        } catch {/* no running session */}
    }

    const handleStart = async() => {
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

    return (
        
        <div style={{ maxWidth: "720px", margin: "40px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
            <style>
                {`
                    @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.03); }
                    100% { transform: scale(1); }
                    }
                `}
            </style>
            <h1 style={{ textAlign: "center", marginBottom: "4px" }}>Focus Timer</h1>
            <p style={{ textAlign: "center", color: "#888", marginBottom: "30px" }}>Build your deep work habit</p>

            {/* --- Clock + Time Buttons --- */}
            <div style={{ ...clockContainer, ...pulseStyle }}>
                <div style={clockCenter}>
                    {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, "0")}
                </div>

                {[15, 30, 45, 60].map((min, index) => {
                    const angle = (index / 4) * 2 * Math.PI
                    const radius = 90

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
                            background: duration === min ? "#4CAF50" : "#fff",
                            color: duration === min ? "#fff" : "#333",
                            border: duration === min ? "2px solid #4CAF50" : "1px solid #ccc",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
                            }}
                            onMouseDown={(e) => e.currentTarget.style.transform += " scale(0.95)"}
                            onMouseUp={(e) => e.currentTarget.style.transform = `translate(${x}px, ${y}px)`}
                            onMouseLeave={(e) => e.currentTarget.style.transform = `translate(${x}px, ${y}px)`}
                        >
                            {min}
                        </button>
                    )
                })}
            </div>
            {justFinished && (
                <div style={{
                    ...cardStyle,
                    textAlign: "center",
                    fontWeight: "bold",
                    background: finishType === "completed" ? "#e8f5e9" : "#fff3e0",
                    color: finishType === "completed" ? "#2e7d32" : "#ef6c00"
                }}>
                    {
                        finishType === "completed"
                        ? "🎉 完成一次專注！"
                        : "⏸️"
                    }
                </div>
            )}
            {/* --- Type & Start/Stop Buttons --- */}
            <div style={responsiveButtonContainer}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    類型：
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
                </label>
                
                {!isRunning ? (
                    <button 
                        onClick={handleStart} 
                        style={btnStyle}
                        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                        onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.95)"}
                        onMouseUp={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                    >
                        Start
                    </button>) : (
                    <button 
                        onClick={handleStopClick} 
                        style={{ ...btnStyle, background: "#f44336" }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                        onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.95)"}
                        onMouseUp={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                    >
                        Stop
                    </button>
                )}
            </div>

            {/* --- Today Card --- */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                <div style={{ ...cardStyle, flex: 1, textAlign: "center" }}>
                    <h3 style={{ color: "#666" }}>Today</h3>
                    <div style={{ fontSize: "28px", fontWeight: "bold" }}>{todayMinutes} min</div>
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
    )
}

const cardStyle = {
  background: "#fff",
  padding: window.innerWidth < 400 ? "14px" : "20px",
  borderRadius: "16px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
  marginBottom: "20px",
  width: "100%"
}

const btnStyle = {
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "none",
    background: "#4CAF50",
    color: "#fff",
    cursor: "pointer",
    transition: "all 0.2s ease"
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
  width: window.innerWidth < 400 ? 160 : 200,
  height: window.innerWidth < 400 ? 160 : 200,
  margin: "20px auto",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const clockCenter = {
  position: "absolute" as const,
  fontSize: window.innerWidth < 400 ? "20px" : "24px",
  fontWeight: "bold"
}

const clockButton = {
  position: "absolute" as const,
  width: window.innerWidth < 400 ? 40 : 50,
  height: window.innerWidth < 400 ? 40 : 50,
  borderRadius: "50%",
  cursor: "pointer",
  transition: "all 0.2s ease",
  fontWeight: "bold",
  userSelect: "none" as const
}

const responsiveButtonContainer = {
  display: "flex",
  flexWrap: "wrap" as const,
  justifyContent: "center",
  alignItems: "center",
  gap: "12px",
  marginBottom: "30px"
}

