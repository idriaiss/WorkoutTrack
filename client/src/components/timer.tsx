import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useTimer } from "@/hooks/use-timer";

export default function Timer() {
  const { time: sessionTime, start: startSession, pause: pauseSession, reset: resetSession, isRunning: sessionRunning } = useTimer();
  const { time: restTime, start: startRest, pause: pauseRest, reset: resetRest, isRunning: restRunning, setTime: setRestTime } = useTimer();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const setRestTimer = (seconds: number) => {
    setRestTime(seconds);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Workout Timer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 text-center">
          {/* Main Session Timer */}
          <div>
            <div className="text-6xl font-bold text-secondary mb-4" data-testid="text-session-timer">
              {formatTime(sessionTime)}
            </div>
            <p className="text-muted-foreground mb-6">Total Session Time</p>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={sessionRunning ? pauseSession : startSession}
                className="bg-primary text-primary-foreground"
                data-testid="button-session-toggle"
              >
                {sessionRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {sessionRunning ? "Pause" : "Start"} Session
              </Button>
              <Button
                onClick={resetSession}
                variant="outline"
                data-testid="button-session-reset"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {/* Rest Timer */}
          <div className="bg-muted rounded-lg p-6">
            <h3 className="font-semibold mb-4">Rest Timer</h3>
            <div className="text-4xl font-bold text-primary mb-4" data-testid="text-rest-timer-main">
              {formatTime(restTime)}
            </div>
            <div className="flex justify-center space-x-4 mb-6">
              <Button
                onClick={restRunning ? pauseRest : startRest}
                className="bg-primary text-primary-foreground"
                data-testid="button-rest-toggle"
              >
                {restRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {restRunning ? "Pause" : "Start"} Rest
              </Button>
              <Button
                onClick={resetRest}
                variant="outline"
                data-testid="button-rest-reset"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>

            {/* Quick Timer Presets */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "1:00", seconds: 60 },
                { label: "1:30", seconds: 90 },
                { label: "2:00", seconds: 120 },
                { label: "3:00", seconds: 180 },
              ].map((preset) => (
                <Button
                  key={preset.seconds}
                  onClick={() => setRestTimer(preset.seconds)}
                  variant="outline"
                  className="font-medium"
                  data-testid={`button-preset-${preset.seconds}`}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
