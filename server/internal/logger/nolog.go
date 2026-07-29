package logger

type NoLog struct{}

func (l NoLog) Debug(_ any) {}

func (l NoLog) Info(_ string) {}

func (l NoLog) Error(_ string) {}

func (l NoLog) Warn(_ string) {}
