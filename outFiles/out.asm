.global fn

fn:
	movl $0, %eax
	cmpl $0, %eax
	xor %eax, %eax
	sete %al
	neg %eax
	not %eax
	ret
