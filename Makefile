executable: entry.c out.s
	gcc -o $@ $^ 

out.s: main.ts
	deno run --allow-read --allow-write main.ts

clean: entry.c out.s main.ts
	rm entry.c
	rm out.s 
	rm main.ts 

