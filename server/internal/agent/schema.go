package agent

type ApplicationInput struct {
	Ad string `json:"ad" jsonschema:"description=It related job opening ad"`
}

type Skills struct {
	Skills []string `json:"skills"`
}
