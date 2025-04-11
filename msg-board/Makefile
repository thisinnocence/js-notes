.PHONY: install

install:
	cd backend && pnpm install && pnpm approve-builds

# prune删除无效依赖
.PHONY: clean
clean:
	cd backend && pnpm prune