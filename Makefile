CLC = closure-compiler
CLCOPTS = --compilation_level ADVANCED_OPTIMIZATIONS

# Match JS files, except those with suffix `.min.js`.
JS = $(filter-out %.min.js,$(wildcard *.js **/*.js))
JSMIN = $(JS:%.js=%.min.js)

.PHONY: all js clean clean-js
all: js
clean: clean-js
js: $(JSMIN)

%.min.js: %.js
	@printf -- '-- Miniying %s ...\n' "$<"
	$(CLC) $(CLCOPTS) $< --js_output_file $@

clean-js:
	@printf -- '-- Cleaning up minified JS ...\n' "$<"
	rm -f -- $(JSMIN)
