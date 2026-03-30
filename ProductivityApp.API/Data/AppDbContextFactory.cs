using Microsoft.EntityFrameworkCore;
using ProductivityApp.API.Data;

public static class DbPathHelper
{
    public static string GetDbPath()
    {
        var tmpPath = "/tmp/productivity.db";
        if (System.IO.Directory.Exists("/tmp"))
            return tmpPath;

        return "productivity.db";
    }
}