// fib_openmp.c
// Compile: gcc -fopenmp -O2 fib_openmp.c -o fib_openmp
// Run: ./fib_openmp <n> <cutoff>  (e.g., ./fib_openmp 40 20)

#include <stdio.h>
#include <stdlib.h>
#include <omp.h>

// naive recursive fib but using OpenMP tasks with cutoff
long fib_task(int n, int cutoff) {
    if (n <= 1) return n;
    if (n <= cutoff) {
        // compute sequentially to avoid task overhead
        long a = 0, b = 1;
        for (int i = 2; i <= n; ++i) {
            long c = a + b;
            a = b; b = c;
        }
        return (n == 0) ? 0 : b;
    }

    long x = 0, y = 0;
    #pragma omp task shared(x) firstprivate(n,cutoff)
    x = fib_task(n-1, cutoff);

    #pragma omp task shared(y) firstprivate(n,cutoff)
    y = fib_task(n-2, cutoff);

    #pragma omp taskwait
    return x + y;
}

long fib_sequential(int n) {
    if (n <= 1) return n;
    long a = 0, b = 1;
    for (int i = 2; i <= n; ++i) {
        long c = a + b;
        a = b; b = c;
    }
    return b;
}

int main(int argc, char **argv) {
    if (argc < 2) {
        printf("Usage: %s <n> [cutoff]\n", argv[0]);
        return 1;
    }
    int n = atoi(argv[1]);
    int cutoff = (argc >= 3) ? atoi(argv[2]) : 20; // default cutoff
    long result;
    double t0 = omp_get_wtime();

    #pragma omp parallel
    {
        #pragma omp single
        {
            result = fib_task(n, cutoff);
        }
    }

    double t1 = omp_get_wtime();
    printf("fib(%d) = %ld\n", n, result);
    printf("time: %f s (cutoff=%d)\n", t1 - t0, cutoff);
    return 0;
}
