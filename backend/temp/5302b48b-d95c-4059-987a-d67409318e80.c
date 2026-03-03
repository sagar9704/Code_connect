#include <stdio.h>

#ifdef _OPENMP
#include <omp.h>
#endif

long fib_seq(int n) {
    if (n <= 1) return n;
    long a = 0, b = 1;
    for (int i = 2; i <= n; i++) {
        long c = a + b;
        a = b; 
        b = c;
    }
    return b;
}

long fib_parallel(int n, int cutoff) {
    if (n <= 1) return n;
    if (n <= cutoff) return fib_seq(n);

    long x = 0, y = 0;

#ifdef _OPENMP
    #pragma omp task shared(x)
    x = fib_parallel(n - 1, cutoff);

    #pragma omp task shared(y)
    y = fib_parallel(n - 2, cutoff);

    #pragma omp taskwait
#else
    x = fib_parallel(n - 1, cutoff);
    y = fib_parallel(n - 2, cutoff);
#endif

    return x + y;
}

int main() {
    int n = 40;
    int cutoff = 20;

#ifdef _OPENMP
    omp_set_num_threads(4);
    double start = omp_get_wtime();

    long result;

    #pragma omp parallel
    {
        #pragma omp single
        result = fib_parallel(n, cutoff);
    }

    double end = omp_get_wtime();

    printf("fib(%d) = %ld\n", n, result);
    printf("time = %f seconds\n", end - start);
#else
    printf("OpenMP not available. Recompile with -fopenmp.\n");
#endif

    return 0;
}
