int main(){
    return 2;
}

typedef struct{
    int a;
    int b;
}SomeStruct;


int func1(SomeStruct * ptr){
    int a = ptr->a;
    int b = ptr->b;
    return a + b;
}

