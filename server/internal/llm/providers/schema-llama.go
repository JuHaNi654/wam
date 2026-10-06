package providers

type LlamaModelMeta struct {
	ID      string   `json:"id"`
	Aliases []string `json:"aliases"`
	Tags    []string `json:"tags"`
	Object  string   `json:"object"`
	OwnedBy string   `json:"owned_by"`
	Created int64    `json:"created"`
	Status  struct {
		Value  string   `json:"value"`
		Args   []string `json:"args"`
		Preset string   `json:"preset"`
	} `json:"status"`
	Architecture struct {
		InputModalities  []string `json:"input_modalities"`
		OutputModalities []string `json:"output_modalities"`
	} `json:"architecture"`
	NeedDownload bool `json:"need_download"`
}

type LlamaAPIModels struct {
	Data   []LlamaModelMeta `json:"data"`
	Object string           `json:"object"`
}

type ModelSSE struct {
	Provider string `json:"provider"`
	Model    string `json:"model"`
	Event    string `json:"event"`
	Data     struct {
		Status string `json:"status"`
	} `json:"data"`
}

type LlamaServerError struct {
	Error struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
		Type    string `json:"type"`
	} `json:"error"`
}
