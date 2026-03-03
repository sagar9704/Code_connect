#include <iostream>
#include <vector>
using namespace std;

void merge_range(vector<long long>& a, vector<long long>& tmp, int l, int m, int r) {
    int i = l, j = m, k = l;
    while (i < m && j < r) {
        if (a[i] <= a[j]) tmp[k++] = a[i++];
        else tmp[k++] = a[j++];
    }
    while (i < m) tmp[k++] = a[i++];
    while (j < r) tmp[k++] = a[j++];
    for (int x = l; x < r; ++x) a[x] = tmp[x];
}

void mergesort_rec(vector<long long>& a, vector<long long>& tmp, int l, int r) {
    if (r - l <= 1) return;
    int m = l + (r - l) / 2;
    mergesort_rec(a, tmp, l, m);
    mergesort_rec(a, tmp, m, r);
    merge_range(a, tmp, l, m, r);
}

void merge_sort(vector<long long>& a) {
    vector<long long> tmp(a.size());
    mergesort_rec(a, tmp, 0, a.size());
}

int main() {
    vector<long long> arr;
    long long x;

    // Read all numbers until EOF (compatible with your runner)
    while (cin >> x) arr.push_back(x);

    if (arr.empty()) {
        cout << "Enter numbers to sort (space/newline separated)\n";
        return 0;
    }

    merge_sort(arr);

    for (size_t i = 0; i < arr.size(); i++) {
        if (i) cout << " ";
        cout << arr[i];
    }
    cout << "\n";
    return 0;
}
