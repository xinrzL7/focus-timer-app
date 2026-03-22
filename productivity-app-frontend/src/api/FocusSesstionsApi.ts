import axios from "axios";
import type { FocusSession } from "../types/FocusSession";
import type { DailyFocus } from "../types/DailyFocus";

const api = axios.create({
    baseURL: "/api"
})

export const getSessions = async(): Promise<FocusSession[]> => {
    const res = await api.get("/FocusSessions")
    return res.data
}

export const getRunningSession = async() => {
    const res = await api.get("/FocusSessions/running")
    return res.data
}

export const startSession = async(minutes: number, typeId: string) => {
    const res = await api.post("/FocusSessions/start", { 
        plannedMinutes: minutes, 
        typeId: typeId
    })
    return res.data
}

export const stopSession = async(id: number) => {
    const res = await api.post(`/FocusSessions/stop/${id}`)
    return res.data
}

export const deleteSessions = async(id: number) => {
    await api.delete(`/FocusSessions/${id}`)
}

export const getWeekDaily = async() => {
    const res = await api.get("/Analytics/week-daily")
    return res.data as DailyFocus[]
}

export const getTodayMinutes = async() => {
    const res = await api.get("/Analytics/today")
    return res.data
}

export const getHistory = async(
    start?: string,   // YYYY-MM-DD
    end?: string,     // YYYY-MM-DD
    typeId?: string
) => {
    const res = await api.get("/FocusSessions/history", {
        params: {
            start: start || undefined,
            end: end || undefined,
            typeId: typeId || undefined
        }
    })

    return res.data
}