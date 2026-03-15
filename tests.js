export const testList = [
`print("TEST F1")
def saluta():
  print("Ciao funzione!")
saluta()
`,
`print("TEST F2")
def somma(a, b):
  return a + b
x = somma(3, 7)
print(x)
`,
`print("TEST F3")
def moltiplica(a, b):
  return a * b
def quadrato(n):
  return moltiplica(n, n)
print(quadrato(5))
`,
`print("TEST F4")
def creaLista(n):
  lst = [0, 0, 0, 0]
  for i in range(n):
    lst[i] = i
  return lst
l = creaLista(4)
print(len(l))
print(l[0])
print(l[3])
`,
`print("TEST F5")
def contaPari(n):
  count = 0
  for i in range(n):
    if(i % 2 == 0):
      count += 1
  return count
print(contaPari(10))
`,
`print("TEST F6")
def reverseList(l):
  i = 0
  j = len(l) - 1
  while(i < j):
    temp = l[i]
    l[i] = l[j]
    l[j] = temp
    i += 1
    j -= 1
  return l
lst = [1,2,3,4,5]
print(reverseList(lst))
`,
`print("TEST F7")
def fib(n):
  a = 0
  b = 1
  i = 0
  while(i < n):
    temp = a
    a = b
    b = temp + b
    i += 1
  return a
print(fib(5))
`,
`print("TEST F8")
def sommaLista(l):
  s = 0
  for i in range(len(l)):
    s += l[i]
  return s
lst = [1,2,3,4]
print(sommaLista(lst))
`,
`print("TEST F9")
def doppio(n):
  return n * 2
def triplo(n):
  return n * 3
print(doppio(3))
print(triplo(3))
`,
`print("TEST F10")
def faiCose(x):
  if(x > 5):
    return "grande"
  else:
    return "piccolo"
print(faiCose(3))
print(faiCose(7))
`,
`a = [1, 2, 3]
a.append(4)
print(a)
`,
`a = [1, 2, 3]
a.pop()
print(a)
`,
`a = [1, 2, 3]
a.reverse()
print(a)
`,
`a = [3, 1, 2]
a.sort()
print(a)
`,
`a = [10, 20, 30]
i = a.index(20)
print(i)
`,
`a = [1, 2, 3]
b = a.copy()
print(b)
`,
];

export const expected = [
`TEST F1
Ciao funzione!
`,
`TEST F2
10
`,
`TEST F3
25
`,
`TEST F4
4
0
3
`,
`TEST F5
5
`,
`TEST F6
5,4,3,2,1
`,
`TEST F7
5
`,
`TEST F8
10
`,
`TEST F9
6
9
`,
`TEST F10
piccolo
grande
`,
`1,2,3,4
`,
`1,2
`,
`3,2,1
`,
`1,2,3
`,
`1
`,
`1,2,3
`,
];