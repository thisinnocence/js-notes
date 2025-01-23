.PHONY: install

install:
	cd backend && npm install

.PHONY: clean
clean:
	cd backend && npm prune