#include <stdio.h>
extern int fn(void);
int main(void){
    int result = fn();
    printf("%d",result);
}