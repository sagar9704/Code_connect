#include <stdio.h>

int main() {
    int choice;
    double a, b;

    printf("1. Add\n2. Subtract\n3. Multiply\n4. Divide\n");
    printf("Enter choice: ");
    scanf("%d", &choice);

    printf("Enter two numbers: ");
    scanf("%lf %lf", &a, &b);

    switch(choice) {
        case 1: printf("Result = %.2lf\n", a + b); break;
        case 2: printf("Result = %.2lf\n", a - b); break;
        case 3: printf("Result = %.2lf\n", a * b); break;
        case 4:
            if (b != 0)
                printf("Result = %.2lf\n", a / b);
            else
                printf("Error: Division by zero\n");
            break;
        default:
            printf("Invalid choice\n");
    }

    return 0;
}
