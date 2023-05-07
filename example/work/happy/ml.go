package happy

import (
	"dash"
	"github.com/ozgio/strutil"
)

func Name() string {
	return strutil.Align("eth interface", strutil.Center, 20)
}

func Dat() string {
	return dash.CleanUp()
}
