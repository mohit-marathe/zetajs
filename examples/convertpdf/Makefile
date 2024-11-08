# -*- Mode: makefile-gmake; tab-width: 2; indent-tabs-mode: nil; fill-column: 100 -*-
# SPDX-License-Identifier: MIT

source := \
  $(LOWAINSTDIR)favicon.ico \
  $(LOWAINSTDIR)soffice.data \
  $(LOWAINSTDIR)soffice.data.js.metadata \
  $(LOWAINSTDIR)soffice.js \
  $(LOWAINSTDIR)soffice.wasm \
  $(LOWAINSTDIR)soffice.worker.js \
  ../../source/zeta.js \
  office_thread.js \
  index.html

define target
all: out/$(notdir $(1))
out/$(notdir $(1)): $(1)
	cp $$< $$@
endef

.PHONY: all
all: | out

.PHONY: clean
clean:
	rm -fr out

out:
	mkdir $@

$(foreach i,$(source),$(eval $(call target,$(i))))

# vim: set noet sw=2 ts=2:
