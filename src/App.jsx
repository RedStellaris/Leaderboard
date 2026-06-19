import { useState, useMemo, useEffect } from "react";

// ==================== LOGO ====================
// Pour le projet Vite : place logo.png dans /public/ et remplace par src="/logo.png"
const LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAIAAAC2BqGFAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAAGYktHRAD/AP8A/6C9p5MAAAAHdElNRQfqBhMFLQ3ut3ssAABRvklEQVR42u39d5xdVdU/jq9dTrn93umTmcmUTHpCGjWQAIFIiyJSFFRAKYKiIAoKihQfQEThKyAgIj0QWmgKYkJJaKkkIaQnk5nJ9Hrrqbv8/thzbyaNovLo7/N6Frzgzr2n7PPea6+9+gH4P/o/+n+J0H96AJ8+OPRpo5T5/8r/9IA/9Vn+Wwjl/5UA4p+9AgYABEL+d+H+XwE0BkAAYh+WDGlaKaXllBRhHMM4glCQECxBHcgAUkIkhUgK0c95t88GfCak+CxX/t+n/yTQCgU+7JsYpROCgSmh4FhNq9JojFDBmeWzLBdpxiwpfIxdzkFKDSEdkwBCIYpjlIYIRQh5UvQx3uT7G1x3vWU3Oy6X8kD3+n8faLW6C1xGMJoSDB0bCU/R9RKCHcabPXer5211vV2+38N5motP40dkYlSMcZVOGzRtrKGPNsxinXoStjG2JJt7L5Mb8H11KP4PSfP/VaAVxAW2mhwKfjUWPcw0sBBbXG9pNrfacdp8JgqHEwxSIimjkYjnugihEZWVnV2dzGdSSoQQIMQ5FwBCcS5CIIbOjmI8yTSODAanB80Squ3k/K+ZzOJUxuJcwQ3/7DbwX00o/2wAEKL0W6UlC0fVLW6ovbWsdGbA1FF+vjEBgJBpjm1spISo70pLSl588cX6+rozzjijq7s7FAoBAMZD1yMYq38pxgpBnVJd01D+dABo0LTLiuIv1tUsamy4trKi1jCG7jZsVP8vEMkvnFLDuLqy/M3G+gU1VadHw6E8WAhjU9MIQpgQADj//PN37tw5cuTII444Ih6PN9TXP/TwQxjju+66e9myZQBwzz33PPHEE0/Mn3/dddcBACUEY6xR2tDQEIlEhs+uhjGlBLDSRGCGad5RUba0sf6e2ppJoWAB7v8KleBfoQLLJDTtlzVV741rvLeyfFqeoRS+GiEIIQAwTXPChPEAcMkll2Qy2Qf+/Gfbts8779xjjjkmnc4YhvH631+/4YYbRo0aJYT47ne/++abby5ZsgQADF0HgGnTpvX09C5Y8PT8+fN/+tOfHn/88ZFIBOfXikEppUTBX2XovygvWdpYf9/I6tEBE/ZccF8Q0S/ouiivV1GMLyorPS8SXp/LfbepZYvnA4BGKQZwGXOEAIDi4uKf/vSnY8aMOe6440455RRCSFPTjosvumji+AmWZdfV1X300TrP8yoqKlavXj1nzpz33//A9/0333zrnXeWAgAgBAAXXHDB6tWrfvnLX6xdu3bbtm133nnnqlWrv/Od8w8++OCBgYGmpiYEYFDKhGh3vZu7++7rG7yoKP5oddXbVu733X39jH2h++QXMpGFreaoeOxvjXVzde2yXW3f6+ja4vkUY4qxz7nL2LRp0+64446SkuKvf/3r3/r2ty+99NL29vaK8nIpRUtLi2EYsVg0nUo1NjY27dhRVlbGOVv/0UeJRGJwsL+stDSXy3744YcIIdd16+rqvvrVr950001f+9rXVqxYcdtttxmGsXDh88cff/ySJUtuu+03995779Rp01zGxo0fP+fYYzHAoBC39faf2dwS4uKV+pqzi+JKEfr/G6mt9qAwpb+vrVk2puGsWFh9r1NqaBrGCABOPvnkBQuefvzxx/v6+i688MKzzjpLCd/33nvv3HPPu+wHP1i+fPmdd9xxxx13xOPxI444Ysb06cFgsL6+nhBi6HpVVdX48ePHjh1rGAYhBACmTZ121VVXJRKJxYsXHzdnzk+u/MmyZcvC4fCHq1dfddVVlNJcLnfNNT+fOnVqR0fHCy+8AACmYRiapqTW4QHztZFVj4+sqjF0GLap/JcSyqN8eDT67pjGP1aWJzAGAEqITodkVElJyWuv/f3hhx/u7e396le/+j//8z/33nvviSee2NrSctNNNz05f/6kSRNra2tHjx4dCAQ+7wB0Xa+oqCCEfPe73505c+aXv/zltra2hoaG6667bs2HawDg3nvv7e7ufuihh+rr6wEAEKKEaIQAAAW4vCj+wei6c4oT8AVI7X/bzBUE3I8qy8+NhH/d2f1SJosxJgBcSiHlvHnzqqqqHnvssba2ttNOO+20075m5bLrPvrosssuO+2000499asbN25YtWoVY2z4ZSmlpmkGAgFd0wzTpJRqmoYQEkIIIVzXdRzHsizXdX3f53wP0y8ajR599NFHH33MIYccfPXVV0sp5z8x/4ILv7t06TuNjY033XTTG2++8ZcH/wIAGiFSSibE9IBxe2X5Ws//RWe3wwX59xmT/x6glaUXIOT+2poRkl+wq7OVMQxAKPUZi0aj11133eGHHz558uQxY8bcfffda9asbW1pOfPMMy686KLGxsbly5cPv1ooFCoqKkokEqFQSKMUEGKMea7LOFf4SikJIRrVCCWUUISRgt5z3XQm09/fn86kfS9vCmIcCoUymcw9d989ZsyYr5x6Kuf87beXeJ67ZMmSqVOn/vjHP965cyclBCPwGA8i9JuK0oaAeWlb1y7P+3dh/W8AWg2lyjAeqxmx1bIu7+rxJOgYjxk/vqWlJZPJ3H777XPmzJkxY8aaNWt///vfFRcXH3rooRdffHFFRcWOHTsKcCQSibLS0kQiQSi1bTudTiWTqWw26ziOEJ9kxCGEKKWhUCgajcbjsUg4out6JpPp6u7u6+tzHEddX9O0c845Z9myZZd875Jp06bOPvroefPmvfzyK7Nnz1q9ejWlNJPJUIyFlELKi2KR84oSV/b0rchZ/0a+/pdQBoBJ4dDy0Y2XF8VBmQ8A5eXlmzdvfuWVV6ZPn37yySc379yJMX7ggQfuvffeaDQ6cuTIwhWCwWDjqFEzZ848cubMcePGFRcXk2FGncII5dVhhFDBJtwL6+Gfw+FwbW3twTNmHHP00TOmTy8pKRl+2Fe+8pU//elPv/zFL3q6e84444zyioqtW7e98soro0ePxgjplGoYA8DcYGBlw8gvx6KFx/xX6F/iaDXVR0Sjf6wo/0131zOpjNpYfM6Li4u3bNmyffv2ww8/PBaLLV26dFdr64dr1tx3332dnZ2AEEgZiUTq6+tj0WgylWpraxscHCxcmVIKUnIhpJSQ5/fq6upsNis4P2XePEopALium81md+3atWLFingsNjA4qPi3QAHTrKmpqSivYJy3tLZ0dHZIIQGgpKTkB9//wccbPl61atXixW8sWvSPJW8vmTJ1yrXXXgsAhBAC0uPiENP444iK2weSzyZT/yJf//NAqxsfHY/dVV7207b2RTlLJwQI9jx/zpw56XR6woQJN95w47wvz2tqapp3yjzO2cIXXlDnBoOB0aPHRKPRzs6O1tZWLy9PKaVSysKeVlZW+pVTvzpt6tSxY8eWlpRW19Tc8fvfaZp2/Q03pJJJTAhjLJFIXHH55bt2td51x/+3edPGjevXr1y58t1lyzr7+pjvM84BACEoLy1vbBxFNW3L1i2dnV2Fp7jnnj96nnfllT8GgPLy8ttv/117e9u1114rpdQw8oUcp2t/riz7YyqzIJn+D8gQtZSOjEXXjmucEwkBwgalhBC1rhctWrTw+YUA8Morr6xcseLCCy6E/LLFGI8ePfro2bNHjRpVEBF7CYTRo0dff/31F1900YknnsgZHxgYGBgY6O3p7e7uPvfcc99+6y3bsnp6erq6ujLpzN9fe238uPHr1qzp6+js3LEj2dLas2lT7+oPr/jGNwhAZXAPHbG8rGzWUUfNPOKIWCymBqPrulJsMMZXXXVVa+uuG2688cn588vKygBAJwQAxmp0WX31GfF/SYb8MycqHeOgcPiBERU/7+habDkmIYhS3/cvveTSYCj4wgsvXH/99YsWL1q0aFFHZ+cjjzyMEJJSFhcVz5gxg3O+du3avr4+5epUXCyljEQixx133I033njF5VecfPLJ3d09GzZuOOP0M5LJZHdXd1t727Jly959511M8Nq1a1etWvXx+o87Ozvu+eMfZ8yYduq8eYL5OiGZdEpH8PT8J3//wJ9/d/aZP5l3cgmhbb29Sd9HANlcrrW1FSE0edLkQCDQ19fHGBNCGIbxpz/96a033+zr68tls+vXr89ms93d3YAxRaiH85WWc1tp8Q7Gmzyf/FNm+ucWHQrlatNcWF/zu86eZ9IZDSGiab7ncSEeffSxyQdNnj5t2uOPP44x/uY3v4kxVjrDhAkTSoqLN27c2NffPzTJhCCEGGOBgFlSUlpdXf3E409QShlnpmE+8cQTf37wz1/72teWL1/evHNn/8BANpslhIi84FakaVo8Ho+GwweNH3/IlCnHHHrosqXv3HrnHbddcN4xRx6ZzVoxjaR2tT2++I37V6/JCKH0ek3TJk6YEI5E1q9fn0qlAKCqquqaa64ZP26cz/iJJ55w5JFH/uQnP7nssss6Ojo0jH0hjgyYt5WXfK+rd4Pj4s/vy/58QKuwaZDSl+pr/5pK/mEgjZh/2OGH//nPD95yy81PPfVUVVXVokWL//rKywjjhx56ePPmTQBgGMa0aVMty/r44w2cc8XdhmGYhpEoSsydO/crXzk1Golecsn37rnnjxjjD5Z9sGTJktWrVw8ODhbkNcaYUoryBDCEtpTC8/wC9GHT9B3n3BnTrjr/XGmYTi7nZbJYiMqA0bV9x7kLnv04k6EYcyEkQEV5+dhx43bu3Nna2goA8Xh89qxZ77z33sUXXXT5jy7/26t/833/V9f9qq+/T2F9Rjh0YXHim+1d/YyhLzRMo+Togw11f6iqAEqjoRAA3Hnnne3t7c07d95///2U0nPO+eaiRYtqa2vVKUVFRcccc0xBn1OSOhQO1dXWXnDBBStWLN+4YcPaD9ds3LDxy1/+8mGHHTZixIjCkYZhBPKk7MNAIDj8G9M0DcMwDCMUCFDDMAKBuSVFFYYOACPD4V+dfNLam2/a/Ntbtv36+sUXnn/mhPGlgcAxiXiEUgBQHlTDMA455JAJ4yeoP8eOHfvCCy807dgxdcoUAHhn6TuPPPIIAFBKKUIAcG1x/JHqis/NoZ/reLXn/rCy4iTTOLWtQ0hJEPJ8f968eZdddtk11/z89b//o7m5+dLvX7p69WpCCOd8xIjKxsbRH63/KDmYVBArWew6zvjxE0Kh4LfPPffwww9fvfrDJ5+c/96777qehxDSNA1jXODZ4Uq0usJe3EQAcr5fHgx+v6RoYU/vOtsxCPE4l0JMLC664aQTNnZ0/vad98aZxg9KS6bp2uJM7oau7hznGCEVA5swYYJpGB+uWfP97/8gGgn39fc3No4+cubMnt6eH//4x6lUyrZt3/fViB4bUf6h6/1//YOfSwn5rEArqTQjErm7ovzc9vbttlNVURGJxTZv3pxIJF584cWdzTs3b94spVy8ePHq1asBoKa6emRt7YcffmjbthIXCCFCCGOstLT0tt/8ZuPGje++9/64cWOfeOIJxpgy3gAAQAIMHY9gyN2s/j8EPQAgkBIU8LbPjqgo/UVx0S07dr5vOwFd5/nJ8HwfSxkh5LcN9YfqRs61U0yUELzadX7S2W1zXpiz+rr6eDz20fr1Slj96Ic/sh174cLnf3jZjy644Lv33nffrbfeSjFmQlQS/HhVxa/6k+/nrH9CWH86BTS6aEzj1+Mx0A0AuOjii9966y3109133/OPf/xjaEowVigfdtihuq4rTkQIYYzU8v/6WWe9/dbba9asufrqq5WGhzE2DEPXdV3XjfwnwzDM/VEg/yEUDFJKwTC+N37MxhlT5gQCABA0dpOu64auE0o1Sr+biL83etTfG+pfqx35cm3Nkoa6myvKcN7oVBNaU1MzberUgpI6cuTIpUvfeezRRxtHjbr3j/eef975AKAssq+Egy/VVgXx53DwfSb1Tnnmbqip8nzvN/2DYV0DhDZu2IAx7urqzGQyhqEfdNBBzzzzNKWUc15RUV5dVb127TrP8woLX9c1zrlpmo2NjfUN9TfccMNTTz2luHiYAb1bJOxhVRf4Of8lQSjnumXx2O0Txn2H4Ms2bVvsOEHD5Plzh+SMGryE1ZZlcX5kOGQLIQClBR+jUQpoteMShISUCKFUKkUJqamp6e3tVXbT7NmzH3jgAU3TvnP++aVlZc899xwghAE2e/5hujbFNN6xHfzv2hXVrB0Zjy0dM6rCMLCuIwDD0JUkNQ0DAOrq6s4++2x1fFEicfDBMwzDGMbLQwoDpfSuP9x13HHHKRGhfJ6KFDsXPhiKtfdHAdPUNQ0wPqqhfvHsI3ZMm3xqNAIIBfZZAUNrQ12fUgC4qqT4zfraZ2qqn6mpml9V+VL1iMOCAQBEMUZoN1+PHj1aPUtlZeXChS+88cYb3/7WtyKRyLRp0wpe8gqM/zaifIppwGfzXH86R0sAgvHdVZWP9PV/YDkmxud861stLa2WldN1w/N9KWU6nf74448BIBgMjBo1asuWrbZtK/mKEcIYIwSci5tvvoVS8sQTj9u2o+v6cA4dEsbD2BghACVp93QYMc4DweDFkyZeUxQL9vbd0t75bCodMAyZv0pB74PhlwYEGK3KWYeaZgXFHhcqjNKg0Xdc15GysPmm0+loJBIKhzOZTDabXbRo0dKlS2Px+DU/v+YnV165q61tw4YNpqYlOTcQOicefSGT+zdwtJqr75WXPjGySoX14/F4d3f3o48+qg6YPn364YcdBvmY/8SJE4uKigqYYYwJIUo4RCKRqVOnKl7WNI1Sqg1x9G6+3s3gedYeTopDQ8HggzMPWzZ9yuK62ouKEgBgDmf/oWN3LxFN03RNV9cEjEdQepCuj9e0ibo2TtMmajROKRBChvkIAaChvj6RSKhvzjv3vNdee+3ss78xbty4xx9/oqa6Wj0gAXi2uuIrkfBnZOoDkrptma4vGlU3I2ACxgHDAAAVV77lllsAYOHzz889/nh14/r6+oIWDAAYI0IwJYRSSunQDqPEyF40hDalmvqT0t1YF3DXNEPXsaZVRaN/bahbPLL6iqIiAFDf74lyHuu9Zo9SjdLhaBZWCcEY4z2QppQ2NDSYpqluQfOhuJqakV//+jcmTpyooJgbDCyoLNfQpytvn3SE0l2uH1EZEvzqnj4dYwGSYOJ63uzZs+++666Ojo4333rr9ttvB4DSktJoLKoc+QghQ9cJIUJKtSKVFoUQklJIOcTvQkgpJUIgpZRCSvVDIScPIRUbQ0oMICCEgJQu50foWhUmr+WsHEY6IQhjFWGBgoGY18CHm+wofzVc0McRQghJBEJIIUSeK6WUwBgLhUK6riWTSYQJ47yivHz20UcfOXPmUUcdNTiYvPCiC5ubmwGh+0qK3nTcZzPZf1LVUzPQEAi83lBbZ+hACCWEEEwIURvdySef/NKLL6kELdM0x4weo+sa5C069BkmGef5iCjm1zSiaUjTdF0P6DqilBgGNQxiGJphhExz6HCM1OAopbquq01P/TnElQhpmmaaZl4r/wwPixA+8IBVctpll132j3/848wzz5w7d+71118PeXExO2AuqKrQP+15D/izmp8bRlRw3/9134CGMc/zBQAgjJWNl0omJUBdbW0ylUomk4qXHdcdM2bMJZdcMmrUKFAb0XDjTgIXPBgMLV++7LrrrlPQ3FpV2aBpHgINoRQXl7Z1XFJWelI4OMiFlCKg6Rdv3nrCeedd8f3vM87ff/fdq66+2jRNQMj3fUrp73//+2nTplmWJTgPhcPLly+/8sorg8Hg+eef/6UvfWnIQSgkF1yR8hcKITzPD4VC7777zl133XV5bU1FwHS5AJAgQaVPBhB+tqdnXTY3urHx2DlzHnjgAYRQKBTK5XKF9fPnitJXLfuF9Ccx9f4zlVSSUY1hTNe0y/v6AaHCxjpUxyAEQiidTkuARCLh+X4ymQQAXdcd1z366KOffvrp0tJSx3HUCVL9I6XKw+dcxGOxP//5AQAQAKdHwqdRmvQ9QLiIkKu6e+s07dJgwLbsYowThNzd2oZran53882RWEyjmmEYumEgjD3PDQSCjz766Lx589KpFMaYcR6Lxu69914AePDBB7/xjW+k0+mh2wOo8IpCGRAILgzT6Ovu+eHVVx0XCn7D0PttBw8xhRQSBMggkjQYXJfNbd++vaW1lRAipchms8PZ8bl05qxY+IV09hNExwGBlgBnxmMfWfZOz9cI4XvpTPlMWUppJBzu7OoEAEPXXdedNWvWc889hxDatWsXxlijmgSJAPm+J6TMs3Pw9eXLFj7/PACUEvK9cLjXZy5CUYTeyFkLLevhqhE5x0lJCAOs9/y7Lev+O++MJxIdnZ0BMxAKhcrLy1tbW8tKS5+YP/+II45obWnBmHDOdUPfvm37/PnzTzn5lC9/+ctbt24lGCOENV1TDCg4V4OXQgJCkBJnf/vb6ebm79aObLNsDiDUxjIk72WflHUEzwqY79gO9z0BgADhAudJCQBvWM4Z4dDMgPm+7RyIqfcPtAAIUXq4of+mp1e5HWC4D7jA3VLG4/FMNuv7TNc01/OOOmrW008/zRm3HVtZND09PRKk4DwejyuBwzknhDz22GNcCEDo0li0DJN+yTXAnhC39g+cFo0eTEiv4AQQReg3be1HHHvs1884o6urmxLqum40Gg2HwyUlJS++9NKY0WPadu3SNJ0x3/dZJBJ5/vnnAeBb3/5WMplkjAEhUvJdbbt8z4OhDVkKKRljwUDw0UcfXrV8+RmxWFcmkxSCSyl278CKqYGCbCTkHQAOCPa0AyVCKuL1geufFAy8bzsH0qn3A7Sak+PCoaTvf+i4GGOxH5BBSmkahq5pnf39lFLP92fNmvX0009LKTO5jEapYRg/+9nPnl6wgAtx9Oyj//LQX3LZrJDS0I0NGza8/OKLAHCIYZwYDA4ILhFEMHp4MNUn5ffj0UEpBECc4EXp7EpC37j2F47nMcYQRlJKxthxxx13+tdOr6ut6+hoJ4Q6jq20mo7OjifmP9HQ0DBt2rTBgUHOmRGJvPvuuxdecKFhGioEMcSrUgKA7/sY45dTqecBMECQUoKQHIJ6SDNRmBQbhhjSkSA/F4BAJj0fELxuWbcVJ0ZQ2nEAV/V+gFacf3w49I9UCvbM0d+LwpFIKp1WUZKjjpr11JNPcs4ty6KE6oZxxRVXzJ8/X/lLTz/9dCmE47hCymAwuGDBgqxlGYR8PxblUnggAwjt9Lw/pTNXFRfHEfQLqQMkhbxtYOCSy344derUzq4uQojkUkrpue6Pr7jC87zOzk5CMGOOBGCMxePx1157rbu7+5prrjEMIzmYBASm7z/z9NNccNd190plAgCicpQAJMD0aPS2itKsz9HQ5o0QSARKy5QgEcYACEkpJQCXMkzJslzuF+1dFKF2n7V6/rFBc346+5mAVgfVmmYxwBLLgbzHdjgnq5vpuo4QuK4rhJg1a/b8+fMZ57ZlEUo1Xbvqpz+d/+STuq57njd50qRjjjmmt68PIUQI3blz58JnnwWAs8LhsZo2wDnBiEq4cyDZqOsnmGYf4xLAQPiOzm6jtvZH3/teZ3eXEIJxVthT7YEBzrmu667rSSkkgBAim80++eSTlNK5c+f29fZywXVN27Rp85KlSwkhNO+WU9b+0JaYd8gIzr8WjQZsx+a8sB8OqfBDdwWEQcghLYog4Aie6+kfLqlPDQfnH0BG432BBoCZAXOn6/Zyvk8gcveWGAiYtm0rXn78sUd9z8tkMhJA07Sf/OQn8598sqDGnn3OOVSjjDHm+4GA+ewzz/QODNTp+tcCZh/nDKQh4e2s9Y7rXh6LWULYXGgSNrne88z/5U9/qhl6LptzXZcx5nmu7/m+5zu2EwgEm5qaNm7aiBB2HEfX9I8++mjNmjUnn3xySUlJOp12XY9Q+spfX7EsS9d1yHu40JC2PfR/jJAvZUMoOJ2Sbp9xhH2MMEYawgQhghBBWMNIx8iRwDD2ATkAFOFVjrfG9xEAlwAAq1w3jNEojcL+tOa9OVrNxgxDX5LXYIbwlQjyS0ICEEKEkNls7sgjj3r00Udc17Ntm2pUo/Sqq6567rnndE0DAM/zqquqTzzhxORgEiQgjDs7Ol9YuBAAzg2HdYAM5xpCaeB/SKVOj4RHabSPcwLgAfy+t3fW8cefMHdud3c3xoRxtvD550877WsA4DM/EU+sXLniT3/602233Wbbtu/5EIKXXnoJAE499dRMJsMYJxR6enqUo7xgHA55soaWKUIgMQAIcVIkYjA/JSXmPEzxXzO5D2w7iDETQzWNVZR8Jx73hZAAAiFPiGfSGcirwgggJWUrYwcbxg5/P2J6D44eqjShNA5yleNC4eih5aP0HsAYaZqWyWRmzZr18MMP2ZaVyWQwxpSQH/7oR0q383yfCwEAZ339rEg0Yju253uGab726t86urqODQYP0Wgf476UBkJPpDMMobNDoV7OXSF0hF5NZzYbxlWXXTaQTDqua5jG4sWL77vvvkwm4/leOBx+7/33LrzwwsMOO6y4uNiyLErJzuadr7zyyuTJkydOmJhKJhlnphlYunRpe3u7YRgyLymUT2DYA4ErRFzXj9S0XtdTv/Z4/oJMdpXnv+O473veMs9b4XmmaWoAvhBqzCtse63vozxrKuhWOt5kQ4NPldFqHsYb+iDjnWwoXJ2f+HxlJMaGYdi2PXv20ffff18um3VdV9cNTdcu/t7Fra27FixY4LquWqRSylGjRvX19qmz+/v7nliwgAKcGQymBGcAJqBtnveCbV8ZjwvOs1JSgB4hHspmL/7+96uqq7u6uk3THBgYeOSRRyzb3rZt29FHz37uuef+5+abQ6HQ3Llzu7u6uOCBYHDpCy9wzr922tdUvinBxHOdv/71r4XnGvYQQ4FHUHudEEdFI3HOe4QEEHGMl1hOrxA4z6oCoFjTTg8Gk44jMOFSOpy/lM0VrlxAdp3rnRwwYgil9tHT9qN1TKB0u+dDXs/Lb4Ag5XCUZ99zz93pVMp1Xd0wEELf+c75HR2dzzz9TCgc8j0PoSFfWDqTVlZvLBp77W+v7mppOT8SSQD0c4EBNIQeTKUn6cZ0Sns5BwAN48d7++J1dWeffkZ3T48QXNO0vzz0l507dwLAjh072tp2/fb22wFg7ty5pSUlXd3dlNCB/v4XX3wxFosdedSRyVRSCmkGzY8+WvfRRx9pmrbbM40gH2pECEAKyaTACM3W9D7X8wGEkEkQ73qeTkkAIZEXlRcUJZDnWwBCihBGK217PWNo2L6nbtHGuSPkGF1b6Xp7WS57AK1+qMb4H5Y9/Pyh4SGk67pC+c477hzo7/d839ANBOgHl/1gcDD56t/+hjDKZrKEUEDctmzHcSQoh53MpFNPPPdMJcBRmt7NmACIYPSO7Wzh/OZoZID5HoCB0GbPXyLl7T/4AZcil80Fg8HtO7Y/++yzCCGQ8rHHH8vlcmoKTzzxxFQq5Xu+GTFXrFje1tb2rW9+KxgI9vT0KOfS3159FQA4536+bHYvIhhzKaeZgRFS9jJGMA5itMpy4oQ+WlaaA6l0AR1A57zXZxjAkHLQ509lc/teTSHbwsU4XVvpep/C0WGMg4B2MDZ8A1FyWdcNx3GOOeaYW2+9tbunm/lM13XXc6+59ufvv//Bz66++umnn7ZsmxKCMHZse1Rj48SJE62cxTkPh8NvvvVmy7btP4tGXc5cKTFGSc4XWNYpgWBcwiAXGCFK8OPp9FHHHjtj2vSu7m6MkRDi0UcftSzLNAwuxODgoKZpUspDDz10VENDd3c3IOT5nsL0hBNPTKVTgAAhsCzrzLPO+upXv4p2B2+GPkgpuRCmYbQ2N99w883HGEbK9x0pkJAa4OWeu9JnByfR9ICZFRIDWFJmENIAKECT5z9uWe1CHCiBZidj001jXzG9G2h15giCfZA9nEPBElVZ3JQ6jjN79uwbb7ixq7PLZ76u6a7n3nLLLcuXL6eU3Pbb3+51y9/d/jvP82zHBglWLvf4c89NBxhJcJ/vI4TCAj1n2QYms3WthzEJEELo7Wy2wzBuPOeczu4ux7ZjsfjyFcuXLFlCCQGECMEI6Zqm+b5//PFz05mMZduhYGjrlq0rV6485JBDKirKe7p7NE3jGDHGq0eMoJqGMUagtDoVFxyS2Bqld913b4Lzaoz7PAcAEQQ7mf+RzwDgCcuu1XUdY09KADAAdjH+WCbTJoQ3TDQPJ/VNk8+ODRj7ejzwcKABoJrSlBB+/loyHxNxPe+kE0+69ZZb+wf6ueAa1VzP/fWvf718+XJCCGMcY6RKhZX6PGfOnEMPPTSdSkkhQ6HQBytXdG7Zclo0lmaMIhREqMlnHzB2tmkiwQFAA0gL8ZLvf+e88yoqKnzP03Ujl8vNnz8fAKimYYRUVMy27bFjxx566KG5XE6lMr319lsAIIRwHEfTqEJSgrRsO5PJZNKZbDabzWWzmWw6nU6lU8lk0nXd3/72trUrV30pEiVsaEMKAKzwPBeAAnQJsSCb06T0heBC2pyPMDSkaR4ARUjuGaQfTh2cEwHFBcvoQKKjhuBuxgoSByGkUep63tixY88888z33nuPcSaE0DTtueeeW7VqlbKw1YY+1IpECACora39YNkHycFBABQKBZ967rlJAG3MTwuOABkIve44VYRYgq/gAiNkAFrtOFo0OqKsbNEbi4WQhmFs2LBh586duq7lk3qRSpmsrq5et25tb2+vpmmc8/ffew8APly9+s477zz44INhWB5wIQxfSNoTQhi6sW3btoUvvqhjTDlbJbgAhAAooHWMAQAHwADved44xzncMJKCI0Dgs4uikV/1eT4AQkMR4+HKhfqYEsIBWUpI757lIHtPSzFCDGC3doKxAs40DM/396ol2a3/7UN7/VQopN1rNe31zb7JooqLVWwlrweD63rDi7cQQpQQIQXnnyOWhPBw7thj5AghKYQEiCD000gkgpAH0peylNJ3OX8ildYwFsoLuA+aEuCaaPhd13tnT8Vjn3QDgikmIYIDGBsYUyk1ABMhh7G9nB6KUzSNEkJV+EqFUgnBhFAlRjDGlBJd01X2pkpVRwAEY8hrqYWKPoKxHJrcgomMVbx8eC6ClKBSUgkhasNWESzF8AgBgoJ9XcBtD8IIYYKHss6G9RcaGgzBSF1FggvQx/k0XbeFBIAU5+MMvVWILp/pGt3XeaySaSZTwiRsYXy4KN9bdFwVi44kxM6f4wihI9Tus9+l0oWQlKo+Ky4qsmzbsnJCyIaGhlAopJJxR44c2dHRvnz5CpXuxT1WXBypqKxIJlOZTMZnTNd1jWpCCuXmFlIILpCKB+428tHwVQ/51D3l/dF1TcEdCgYDwaDv+4JzZYgyxhhjUgh1gWHRWrk73QmGnEr5VbJHEshQmiAggQBL+TFj77ruYbo2yAUBGHCcUwOBLa7nc6ERsq87EACyEhL7ZIvtDfS9gykNgQo+qNwdDMiVUmkhhXVWVVVVWlqiUi1c102nM1OnTp08eXJlRUUoHL7xxhsBQNM0tbKOPXZOXV1tf/9AX19fb2/vpo0bhZSGZui6LoTIZDIICZJnMZKXEqjwzMPyaqSUQ/k4IKUUiaKi6upqy7K44AEzIKVU3n1AqKmpybIslSagNPm9RQeC3V/nU3nyUXkkpcRSSiFAyr85Tg3GpQj5ALaUCcHPCIeeymTlAXLvMlKMwHuLij3+RgAIYxeQh5CPkANggXQAMkLI/IqmlFZWVFRVjYhEIiUlxbNmzfY8/80332xvb9u1a5freb7vL1682LIsxV9VVVXnfvvcUDgcDAZLSko0TVu3bp3v+xIk59ww9OLiYsMwKKFKzpiBgKEbKqlDBbaH5CCCgldTLQVCaTqdbmpq6u/vcx1327ZtgwMD7R0dAwP9Vs4yTZNSivOcq+ZPgY5gqPAWAKQQXAghpeBcFYzmq0aFWkkYwAfo47wYoR7BM0L2MhYD1MJFmjNSWBPDZHQNoZUEL/P2sJL24OgwRldFwzoCAYggpCbckvKOdMbCGITAhDSOGhWJRBKJovLy8prq6sbGxgULFgBANpNdt27dmjVrjp49+4brr/94w4amph0bNmycMH58cUlxLpvTNV2CXL9+ve/7KkmBEFJdXT1jxoy+vv5MJpPLZlUo3QyYBBMhhOd5uVwOYyQlCCGkkJjgwoap0qBKSkoS8bj6MxaLhsORouLiHdu3J5NJ3/MIIbZtNzY2xuNxJWEIpY7j9Pf3l5SUUI1C3pfDGOOcAyBCyMDAgOd5tm3btg0YYyF2CLHDdYcB6qkltt/YEwNpoE8UHVkhf5/KDMnIIccoAEBOSoMQl/OiWKy4pCQUClWUl9eMHNnY2JhMJrdv3666DASCQSHE1GnTwpHIQZMnTxg/fu7cE154YeFvbr11VGNjRXlFZWVlU1OTquGWQsTi8YMOmhKPJxDgUChk27bns66uLsuy1D5mGEY8Hvc8jzGm/qsyRhQTcc4DgQDz/a3btqnPs2fPmnnEkTNmTA8GQ+++9+7v77ijva3N0HXPdRljGCNNMyklqsxWpSuqrUFF581AoLe3lxASiUQIIc3NzblcTqOUo721q0JbDyXZ9toSpdyPC2lv7x1GAAAYEABSOa9pIQBANeEZMWJEeVlZRWVlVVVVZeWIxsbGp556yrbtcDhMCKGURiKR8rKy3p5ey7KUxt3e3t7c3Lxm7VqMcVlZ2VFHHVVRXt7b19vd3WNZ1uDgYCwai8djSnoIwQOBQC6Xc10PAMrLykpLS3OWlc1kMtks51wlNXDOFUC5XM62bSVPMpnMhg0bKaGLFv2jrq5u0uTJv77ppltuvrl11654Is4ZE1JqOqRSKd/3A4GA57nD9GuMEBoYHEylUtU1NWVlZalkMpkcxBgP2SbD0yfVN/k/9lVwJQA7ENBKuMQQuiIUwmgoog4IiER/zGRapQgFg+Xl5Tubm3t6e0tLSquqqyorK3t6unfs2BGNRgghCGHXdUc3NuqGmctmueAY4baO9lQqFYvFlNkWjUbHjxtn2bbrOlbO2tHU9MbixdFYbMSIERUVFeFwmHPuuq7neUIIxnxMMMJYSjGydmRFRSXnvKur03FcTdOy2Ww2m81kMr29vZ7nqafdsmVLS0sLQmj5ihVr162dPGnyFVdc8djjj2/atMk0DC6YFIAw1jUNYySFrpgDU0wJ0XTNdZ1QMFhdXiY4z2Yyvs8KVg9gXNBMKCEIgc84wXgvrb8ApjgQ0OrYpJS3ZLIqnatgyaSkxBhTTXNdN5PJZDKZrq6u9R+vB4BQOHz9r3510kknpZLJdCYzODiYTqc3b95ECdUNPRqNtre1JZNJXdellL7vh8PhdDqtiuhNM+D7fiqdtixr165dmqZNnjx53LhxJSUlmUwml8sNDg709w+kU+loLOZ5Xuuu1qJEor6ubuLEibbjNO9syWYzmq55np9OpzOZTHd3d2trq23bGKFwKOS53qZNmzRNO+fsc+64847W1lZKKWNsaKV3d+/GZVip10HTp/dkslnXs3I55vuYYAxIqPaQGAcIMQnhIC2PEYQMXbddd1+gNQD2yf5oDFBDaQtje3kVlTqVSqUBgBCCEVJbytgxY2KxmG3bsVg8Fo/X1ta9/vrfN2/eRAgVQmCMKysrZ82alUwmU6lUMpmMxWKWbUshDNOkhHZ1dQEAoZSqMkXOOeOUUF3XmK+HQuGmpibf93F7uwqPRKORE0444e577mlq2hkImBUVlQigr79f1/VIJJKIJ6ZOnUoISafTAwMDCtNt27ZJKS+//PL77rtvx/btIUOXVJOepxHKKZGcq6guACCMfSFQT7dpZUcCXtPfDwgRhAVAwNCiuhbCxBM85zMhwaAEMynI/rPLTYS8YY7P/QCtI7g0FPpDJtMqBB4WO8AISQmqnl1KKQCQEADQ0NDge75t2apjRjaT7e3t1TXddmzGuO/7Y8aMqamu8XzP9zzP9997771169aFw2HVkYMQWlJczDh3XVexfHdP9+TJk+pq65Kp5MqVq9LpdDgcBoBsNjOytnZERUXTjiZd0ydOnJizckVFRb29vdFotLGxcfnyZTt37kQIRcLheCJRUlzMBY9Go4GA2dnVFQqFv/71r//hzjulbXNCI4Byju0QolOKALCUXMqwYVRREnS98mTazWabERgYF1FaFwoGNc2R0M98AhLpelbwuO/3SKntqdsVKEKw88kcbUuwpAhgDELs0S9LhSOEGG6tUUrLy8td1xFSCF9QQi3bUoai7zPPdTVdDwaDjmMLKaimJZPJrs5OLsTAwAAAaJp24oknEkKUZy1nWV1dXX19fc3NzbquE4xbWlrCkTAhWAh50EEHgYTikpJ333u/qrqqafuOdCbTvLMZAAzDkELouj5jxoxJkyanU6mmnTsnT5o0mExSQuobGmLRWHtHWyadnjZ1ak/Tzh7f81mmvKaaCznQ26sadAQjkYMPmhLVdRIKw/at65KDR2hao0ZjILttux2TsBDlGmkXcpCxCtfZ6HlhjDgh+wcao8F9vC67mX8o0cAw2zlv53x4DQxCKBQM5SxL5okxVlxcfNKJJwoxVKQWDAY2b9q0fft213UtyxJSFiUSjuswxkLBkK5p0Wi0duTIWHGxx1gum00kEuXl5a7j+L6PCYnFYpTS0tKS6dOnHXLwIWXlZVzwMWPGIIBkcjCdSpeWlS37YFk6k+rt7cvldgc4VGFHIh5njLV3dORyuVAotLO5ed3atZ1dXRs3bJgwYXzjqMaqqqqe/r5laz50bdsVwpeyOmD6loUxJowFY7HEiMrOVMpxHFpfN27CxBFjx4TGjN0VLxoRMKflMiFd2yZRUMopgm+wHeQzquuurju2vS/QcwyjhbEd/BN9HTkpyyiGPQMxnHNCSSAQiMVi5WVlkWgkEom6nvfkU08JzgGBpmmGYdTX1R977JxUKpXNZl3H6R8YGBwcRIAY56FAQDP07W1tEc87dOzYrfG4lU5TQlzX9XwfIdTV1eW57smnnDJp0sTSklJK6dy5X8pms+lUMplM9vX1FReXjBk9WkgZCgX7e3s9n6VSqVQqtWtXa3//QCwewxhv374dpIwnEhjj6prq6qrq6urqQCAwoqoqkUhMnDTBse2XX3kFI5TNZGzJp4aDQSEpgiWOs2P79kgwGIhryb6+TCpVXla2ZefO4i2bK6qquoPBJtubQUSdkE+7HnBehmAb1bR9+uLIIY7GvWI/qsjunVAAfDsURAg9ls3t5cOsrq4eHBwcM2b05EmT44l4RXnFG2+++cYbb2CMQUpMSDwev/jii3VNt2wrl8u9+re/ZXPZ4uISzjlGKB6Pt/d0T02nieO4CGmjxwzE4gPdXQrlaDQ6Y8b0cDhi5XKu63HOcrms5/nVVSNmzZ7tut6HH67evn27lDCYSlq5nO/5yk5OJpPl5eXl5eWhYMAwTAAwTFPXNYxQyrK3bdqUiMcTRYlgMEipFo/HMUbjxo1/8MEHV69eXVFSEtF1LBhNZZql1ExThZ4xxgQjEgwlBgYM29rC2NUTx020bN91/5Kzm2z7YMEXZi2ztNRznEwmsxegIYRuiEb+kM22cfFJHN3F+WR9j8wEdbTv+5qm9fcP5CyLUi0dzLS1tSkRiTFijCcSCV3XM+mMEHzVypXtHR2hUKizsxMAAqbRk0kfbNsDtv2+6wFAw/qP4nV1HiZSCAFyypQpCKF169ZplBJKMpksQmjWUUeVlpY8+dSCDz74wHUdCcB8VjAxlPgqKioKBAIIIdfzMaGmYcSiUcu21m/bPrmsrKKsbNEbb6jxBwKBkpISQsiIyhE/u/rqPz3wwNZt20gwYKUz3RhTkKp0V3A+FCt33FFSrvBZmotQNleE0G2O38/5WQgWcpEjpNg0M6nUXjwrAYoxRgj1K0fKfjdD9W0H58cSc/hB6oPrOKFwOJvNMub7vp9Kpvr6+pRUASCe55WWlpqGYeFcKpXctHmzpmnKXYkxdriIOy5zrPc9RhDiAJ2AQp4XLS83qTZr9uzenp6tW7dplAop0gPp0rKy4+bM2dHU9OcHH+zv75dCYEKi0SgJEMaYBCGEYIxFo9F4PJ5Op4UQKjyPEfJc56Nt24/13eDGjw8ZN65ldOPWbdtVAxRlN7308ssTxo0b1dDwwQcfTDnssI7U5pSmea6LUB4ahBDGISFcIdKeD1JssOzVlBLJLwDxVwnbdCMISAJ4nrcv0LUEpwW399kj9+boDi4CGBcT3L8n51uWXVpWNjg4mMlkA4FgMpXMZDIIKaBBSllXW2sYBtW1nc3NlmWZpjmknyJwfL/UdTf5HAgBITAAI2R7d8/YouKDjziyqampt7c3YJqe7zuOc9CUgyaMn/Diiy8ufeedWCw2atQo27ZyOcv3faSBz3zOOWPM9/14LN7b26PrRsE3EgoGd/X11g8mLdt6yLJqV384qa6+ORyWto0QaJrmOE5LS4trW+lMxrKsJatWhaKxdCqFVPMQjFXAQCAcR5BhHKQAgA2WMy8SGivFKwJWFxXrAwPUNFUKg6poUq4lJWnX+mwz29cC34ejB4VwAOo12s+94UB7vocAMMapZLKkuFj1bjHNgKorI4R2dnW98OKLmUymublZJfKClAhjBoC4z33WJ6VBCKLUdR3f8w4aN+6kU05Zs26dY9vBQMBxXcH5scceA4DuuPPO1pYWTEgqlXJd1zTNSCSi3EkEIwmIc2bbtuf5nudzvtsI9jyP6voo5j/r+UHD3OU4ZYODxcFgVy6nAgWO4+SyWR6P9/X2IYSy2ayVzaoMMcFYPkiOOEIIwJYSKAHOZxj6TM6eAfxOWTn1vFwuN6KysjuZrMHox7G4I4WQ0hPSk8KXUkfoJcfpFXuoHLCvZSgA2n02nmqrYO8UkGwul0gkPt6woWlnk+t6sVhM1zQVGQkFg329vY7rKp8GZ0yxM0ZIIqQLPsglA8lcNxqJRKORGdNnNI4Z/eHatb7n6bpu2XY8Hp95xBEff/zxCy++6Pu+bhjKb5nL5XK53EB/P0KIUKqCZwjhgGn6jCFQgTsOgAjGthCjPa/TcVMAOJcTCPU7NlNFdgC+7zPfz2QyW3fu9DzPMHQpJMKY5xuLyd3phQBSuJwjjBEmAd97WQuurK3BmfRAb49Gia7rXi6XAXg0neZDfC2xBA0hDaCd7y2gYb8pYZs8/+iAue+hyWSyvr5+165druuq2m4JMhFPmKYZjUZjsVhnZ6dlWZxzISWWEkAyLiWABpAFUE70dCYzc+bMxsbGjRs2qMpvy7Lq6+pGjx79yl//umzZB1OnTisuKmKM7dixo629nTOGscpXRlIIn3PXdcOhkOd5rudhjJFACGEppeDcw6hcoA4hwPNUUn+WDTmGVAxBpV66rsO5YIwFA4FINFJRUd7S0rqX6eExrkkZisW0bLapuDg9stYfSKb6+sLZnFNUZDsOSGlj/JEYKj+CT6M9gFaHb/D90yLBIowHxF5i2uKcFxcXm6YZi8V0XWfMF1yk0qnWlhbLtkwzMGb0aNM0lfutcFkOwNBQ7t6ZZ5yRSCQ+/vjjYDDIOXc99+CDDyaU3nfffW3t7RijDz9cjTHRNM33Pc4FIMT3UVdzVg5jgoZSavKuTpBICE1Cu+8XntwXkkoBAIyzwcFBZekUguWE0lQq3dvbt6+BZ/l+dShkmSa2bbdxTDadbmprHZvLtYEMRaOdXV2jCLkyEfeE8KTgUvoSXCFMhN5z3dddD30yR6vfujhPMT5J15Y6buEE9SE5ODhmzJje3t7Ozk7bsjzPGx5i8H0PYXzzLbds3bKlubn5o48+amlpAQCBsSOEGQh885xzGPObmprCkYhtWYFA4Igjjti+Y8fChc/nchbJxzqlHCoFBJVYommKH6UUnAvBOcuLJiFEoWofY0wRZhKSjMWLEtzzM9ksICSkAIKzmUwyOaSN6ZqmqlEsyyrkiWka5VwUgq0WAPL8gZ6eKSNG9KVSK9d/fBySzHEGQuEKQMy2uxC6bWBwKJCvegMA6Aj1iP3IDdg33UBZ3hWUTtD194YBPbSgfL+4uHjTpk22bXPBEcKFfnUYY86F57o1NTXlZWX1dXWHHX44Y6y5uVlIWVFS8o1vfjOdTvf19QUDgVwuV1lZOXXatDfffPPll1/mnKuMuuG1DqpHBaFExVaE4IU3VRSOLCQ9SymFkBhBpZTNQvi+L4XgUoYICYaCacdFAKFgIBgKlZWVmYFAKBQa1dBQW1tbVFRkmkYwGBLqrLzXjQMEpKgQIh0M7mhvPxVghOu85fmBsrJcNuPYdpTSLMgcyJyEjIQMQBogJYT1WURHYSpWuN5xoUAU4/Se0sPzvObmZkqIrxSaYYva0HXdMBBGjzzyCEYoGo1OnDSpvb0dAGpra085ZV5PT3cum9UodV1nwoQJwWDwscce27p1qyqRLDzkMPgAdL3QNJfzPfJjTNNMJBIq5JrOZEzD6OvvZz6zCCEYe4xRwzBNkwrhcqGC3ITScDjs+34sFqupqUEIenv7enp6MpkMY8we5rUYysGVEhOip1KnEVwlxdO2028Yo0xzS1vbnIB5TiiY4oJLyaVUQzcRLHG8V10X7Y+j9w/0dt9Pc3GYaSyy7L1Oy2azPmMF1guYpm7ozGee76VSqZLi4tqRI1WN1FtvvWXb9vjx4+edcsqmTZsAwDCNaCRaUlLS1t7+2mt/z2TSBGOMUCgcNQNmMplizGeMl5SUTJ48uay0VMXOCSHMZz5jnudYOSuZSqlwFGOsv7/fdmzXdSEfz8YYUQQeQHFx8UAqhRH2MY5EIqrTQS6XdRzHcZzu7u7hrVALpPIA1FRzgKAQx/g++PCA7ycBqktKBtNpAFjteh85Lgegyr4B4FJKBLbcjeGnAA15Je9t2zkuaC6y9rBxQsGgpuuZTEajVMEdCAbHjRtXU11dWlra09O9YeOm5pZmhLCqZgCARDy+q63NMM1QMEgo6evtW/rOO0rXVhWMAXMoH1cIybkoSiTmHDunrKwUIWQGAoauGYZhBoK6pqki7Fdf+/uaNWuCwaAUIhgMcM49z9U0TW2AlgRNiHA8rhsG4hxrWqSoKI6Qz/xUKq3MSNse0udUZqFuGCq1QWXy2ZaVcxwuxAyNHq1rrR57yXGyUpqGEQqHO7dvB4DU8P1ZSgAowTiMUJ84YNuwAxbdRzG+q7T45sHkNs8vMHUwGAQA13HCkTAhQxuUCqaEQ+GSkpKS0hKM8caNm1paWighfCgvAOm6QQjhjDmuixAKBEwhJGNMRRGG5/tUVlT4zLcsW+V9qZQMhLGmUUopIdR1XYxxcXGxlDKXyyWTSdu2A4GAlcsJKWsRQhj3JxLCcTTfl4yl9kkmooSovinBQCAQDGiarqoNLcvKZbM516WMHa7RSTpd73hv2y6TAqSsq621bbu7p2cv4FSE8JpYtMX3n7TsA5Uo7x9odfQPY1GK4M5ket+TTdM0dD2VTofDIUIoSClBMsYJIdFIJBqLUqq5rmvblmM7ff39he7EGONC5txeifgE47Ly8rq6OkqpENz3fLUQGeOCc8aZ53qc80w2q2ma0g5zuazjuLlcDmOsrqYDjENoE0JE04KeN5gX/CpSodJ8C81pKKXK5HEcO5vLuZ7HOS+ScjRGIQQbPH+H52MAwXk4HK6urt6yZcteiqBiwTpKfxaNXJtMDgqJDiA69g/0kH+E0l8lYtcMJHs43/d8gvG+Gq7yrhFCCp15OOeK1yAf5KWUaJpGCPV9X6WQcM5t22a+DwhUi2N1EaW6EUJ1XVOpLQjA833V5S2bzaoCY1BdFWxb6ZplAKUIpaS0w2Gu60jdlxJdN1TudiFIpOJnSmoLAMJ5kRQJhHJC7PL8rBBEDvVsGTt2bE9Pz75iXbHgJZEwAfnHTA5/3jYSKqOjhbFtvn9aOPinVGZfoCWAktQwLElX6SGcc8/zVK8FSojKCVGJsIQxTdM4F5Ry1edH13WEUDwWkyAJURkAFED6PmO+zzlXziaFiOu6GqW6rmOMKisrA4GA6zg+YwosJS57AAalBIzDhmkMTSpRqUwqO0C5YjhjrlIcpQQhdMZMKX0ETVykOBdCqAIWIWVFRYXv+/uirIRGOSFTdO3WZBo+sS/bAd8spM55LmddXxR/MWt178PUQghCSCgUtCxbo9Q0zXzS2m6SUjLOYZiUZIy5w3Kr9hg3giF7D2NMCh8w5wIBCCGYUgERikYiRUVF2Wy2v68vmUrt5a4EAB8AA1jZDNN1lUU1vD+1yjgt2ESSc8S5L6UL4ArhS4EkINXmQMqAGSgqKtq2bduB1v2pwcAWn7Xub9HvdfABSS2En8QigNDv9yepASAYCJiBwMDAQDQaMQ1T5JO1VEGy2gyFEIqd5WfwCXwyKXkyBP2wvKHdtUAACGONUpJvHD48ZUtNP+fKjYmEEJxzmbcVxDA7SI0VITR69Oje3t79srMEGEnIdbHojal026cB/el977b77PxoeJPPejnfd1p8xgzDiEQig4ODapjKilMileZ1BUwIpVQfagamvtjtphgC60C8gNDXvnaaSozjXKW0AyBU6HJMMKaaRgjRNKquj/MZFwrKIbM9z8gqZZRz9VlKUJ2zhqGcp/q6Os/zuodl2+zFod+PhLf6/tuu96n9HD+l5ZLi4m+GgzMM48r+wQNNWnl5Oee8r6+v0MAR8gn0u5Oqh/dz3Z1cUuAgEEOdeCCfoC4RQpzzqhFV69atw4Rs2rRp1aqVS5cuXb58uQqkAQDGWDVNE5wjjAtJ7Hio+1jeUs8PY180Cz/xYUuEMVZZWRmNRrds2XIgWA4xjO+EAlcPprKfYaV+pm67GODukqJFjvti9oAb64jKSp+x3t7ez3LB4c0ZASHACCQgjPR8U1YFBCHEsqyzzz77/vvvTw4mg8FgIBAABL29vZs2bVqxYsX777+/fv1HXV3dKlglhxHby4E51L/nswwNSSmLi4srKio2b96835x+ADAQuiMRezFnLdqnSPafBFqx3kG6fm1x7Me9A51s/8IIAVRVV3ue29PTCwAU4DBNG6EKBBGofgw6xhrGhBCKUYAQkKCy2oSEAILVjvdXyzLylSxKw7Ms6/777//mOd/s7e3BGPv57seBQMAwDM/12trbtm/fcffddy1ZssQ0TdUyyRPihGBwmqFnhEBDCwaYQl+qxDjJAZgQvpRcSialL+Uan6mi9aJEUc3Ims2bN+9331awXhyN1CC4bn/62H7p099nqFS9jzzv7Zx9RSz6s/7BAx3W1tZWU1NTWVHR2dXFAD5iLIIgjhAD8BFSqWVE9aVDYGCiWFfxgo0xYlxpFwV+d103Fo0efPDBqXRKAnAuQsGQ53uu47iuKzgHQKFgaO7c4x966C8w1AVJgpQIwBSiz3Y4SImQFEPFxlJKf6iufaisgkogIDUJWzlXrx5IJBIjR9Zs2bb1E1Ceahgzdf3nA/uH4p/k6AIRgD8UJ5Z53hOZ3Cc0A6+qqsIItbW3D5eDFIDvNfMoX66Xzz7WALAEpnyhUmJCPM+bNWvWggULMukMJhgkbN6yuaa6pryiPJfN+cwXQmhU6+rumjdvXiaTUf3thJSq5pIJkd8K9i809mXGkpKSEZWV27ZvK/hD9j0+hPHv4rGFudxnFBoFBD7rhHCA3yXTtxUnNnrsQ/eAb25ob28vLS2tq6trb2vzfF9V842hZLamqZwHirGOUQBjjDDFWBvibAgALLbsx7JZOqzN3pEzj0QIOa5jGubA4MA555yj6/phhx76s5//vKS42HFcPap/+OGaTCajaZpQOpaU54XDR+p6VnImpEAgpORSuhJ8KbiQjpRCCC7lBsaXMaYQlQA1NTXRaHTzli37KubD6bJIeKvvL3I99JlR/hxAKwHSzPn9qfRPYpEf97Mezg+EtUoOH1lb293drXJ5NjLewng5xgDAQcV9JZe7Cz0lgKo4A6UgI6Tybg899NCBgQHHtkPB0FtvvaWszdUffqhpmm07nucxzpYuXQIwpKwodf3VXPZV1UBHSkBA8m3UJAABIAAYwJGyPb/mCCENDQ0AsGnTpgO9AE097FnhUBVGV6ey8Dn7c3+Od84KAAzwluvVWfYvE7Gr+wcdeUAfinoBgeKRzo4OIWUOoEkIANAARlGCVcciQBgjihBRRbII7XDdVs+nGDPOx44dW1tXmxxMCilsx25vb1cqweGHHR6PxXt6egghPT09q1atAgAuhGoqU69ppYQwkExKnt/rVGY4AegXMrmnNhaJROpqa/sHBjo6Og707ArlmaZxiqH9Kpl2DlB3/+8BGvK1rg9nrTJMfhGPXjeYkvu7JcZICOl53o4dO8rKykaPGd3R0alYW42YSThCo5WEACCCkU6wDggBhDFZImSr56uq1xkzZmCEXM+lhPb19p39jbNP+NKXli9fXt/QkEwlPc8LBoPr163ftWtXoSYOAI429FGEOEL6IJmQDKQnBJeAAbZy1iNYYRkhhKqqquLxeHNLixpelGApIbMnU6sxN2raxcHgH9OZFi6+8BfeDL/3r+NRB6FfD6aGWpflf1Ix1qOPPvq3v/3t22+//cvrfskZr6urFVx0dnW6rvfJVy6UFQsh7r77nhkzpg8ODA4V0SPQKA0Egqo2jQsejyceeOBPjz32WCGwu9dgPoESicSIEZWZTLatrU2JCwJwUyL+l0y2aViTwKE3KVF6YzTybC7398+zAe6F2OcmxQ43JdNxCVfHIrvtPgBly51wwgnPP/dca0uLEGLRPxbNOXZOU9POTCZTX1dfXV09vNvwvvOslDCVTpdKDnZ3dZmmEQgGMEa+56Uzmc7OjmQy6fs+81k6nV65ciUMs/TkZ0A5FAyOHTOmoqKipaW1tbVVdY4+KRg4KxQ0hOzkDPZEuYKQ62PR1237n0YZ/um3mSEABrDEcU8NBg829XccFwBU9vy8U+bdfvvtr7766mU//OFrr73W3t7+jbPPfuONN3KW1T8wEAoGq0aMCASDjuMUjC6E9oM45/zNt95a9I9/bNiwcaB/gBASiUYDpkkI8X1mOzYC1NHRMf/J+fstjSqMc/iVQ8Fg7ciR5WVlPb29ra2tSrsgCAyEjjP0ozQdYYQx7uXclpIACIARlN4Qi75t2wsO3OD1CwR6GNbOl0xzTsB8z/VUlszpZ5ze0NBw6fe/PzAwQAjZsWPHyy+9NGXKlIXPP79p06YNGzak02nTNKtGjIhFo1wId4+KVNjLt2Q7Tuuu1pUrV77++uvvv/9+c3Oz47qGYQQDwXg8vmTpkuXLl+N9akn2ugjGKJEoqqmpicdifalU886dqoIaA3wlHLw0Et7h+39zXIZgJCENhDgA2xiTAI2a9qt4bJFl/Yso/6uE8nP1i1j0npKiUvX2GoDzzj3v8cefmDlzpjqsob5h7Zq1jz/++PA3UFNKS0tKxo4dO3nSpJqaGlW0vPf1EVKNZ8ie5e3hcHjypMmXXHLJlClTIP+KnX29f6p2qG7kyEkTJowePbq4qAgAyjA6OxwiAMWEXB+PfScUvLcodkkkBACXh0PnBgMAoETbYbr+WHHRKYHP+gKQLxxr9YAXhEPzy4qn6EPy96gjj/zVr36FECoqKn79768///zzlNLx48dfddXV6qWNw6mysnLSxIkTJkyor68vKSlWLsD93mvPNx7snwzDKC0tra+vHz9u3Phx44orKpCuF7qCfCkQ+Ed5aQiheab5aFECAE4PmPcWJXSAL+l6RX5GTw8GH0nEDte0fxfK/6TWsRepZTXHNC4Ih1523GdyVmEt/+UvD5WWlJx3/nme57300stC8JNPPnnG9OkI42XLllVWVs6cOfP111/PZrOhUCgWi0UiEU2jggvf923Htm1HdSVVaWDKM6eUENXfAxOiaZqh64FAQL04HCHEOUunM6lk0nacCoTKCVnHmIaQL2U1IXck4relMx2M3R6P3pLJjtW0Y3Xt56mMJSUAhBG+NBoegeDOdLZV/DOa3BcIdAHrkYT8NBbNgLwrk+32GQDMmDYtmU7v2LHj/vvurxlZc+aZZ5aXlz///POvv/73a6659ne/+928efOOPPLI/v7+QigEYxwIBELBoGEa6uXfGGGVBLI7iQlABQ6ElIxzn3NXRRUt23Vs5VlWQ7omGq2n5HnbnhMwN3n+I9ncXfHYSt9/PGf9LhYJILzO85+z7QEpAeAgXbs4FNrG/D9lcs7+mhH90/T5DJZPIGU3tnL+k4HBc8PB3ydiT+esV3L26jVrACAUDPq+17Zr1+jRY375i2s3bdp0zTXXHn/88V/60peWLVv2ve9979133126dOlQSEkIlRa9exYLXTsAlGBRiPucq5ZPBkAAID0MF4pQCKGUELs4m6JrUYCsz8YRAgA7GBtLMADMt2wm5XrGAcBE6Fvh0GEafTKbe8vz99sE6l+hfxtHD7+cBJis0e+GQwLhhy3rY9cDKTFChx9++Ne/8Y0RlZWXX3HFwMDgs88+8/HHH19zzTUPPfRwXW3tiSedqF5iJqU0TVPX9Uw6XVAmzjjjzIMOmtzW1vbggw8WQD8rHJqoaUEADeMqgu9KZ99xnENNc5qmVRA8gpAfDwweYxinBwMXDAzOM81TA+ZFg8mTDX0ipXfkrIID8kjTPCtgdjL2l1yuV0j82fTxz0X/No6GPMQAgAHW++yqwdQZwcBPw6ENhvFkzmpn7P0PPli1alVxUVFnd/eVV15ZXVV9zTXXjGpoGDd27G9v/63necrAi0Qid911l0a17p7uZHLwnnv+OHHChGuvvWbTpo1Lly5VBbxSSg3gJMNo8/1fpjPjNPo/saiQoojgayPhh7PZrZ64PBoJYtTFGQWYpGkjKUlxoQG86XqLXE+hPJrSr4dDRRg9ncm97+/ZkfW/GWhFIt+wfoFlL7adb4aDtyZiKz1/oW23e35ndzcAvLhwYWdHx7e++a2JEyesWLlCtX5WNPf446dOnXrKKScfe8yxP//5zx999NGDDz4km81u27ZdxUnVxSMYE4Q6QdZq2jRDt4VoZyyEUMr3P3Q9E6McFwZAUggh5FdNY6PvP+1aPgDLpxd9NRgYjfFS13vJtp38cvyClOUvBOjCcDFAn5R/yORqLOesYOCmcHgjY6847lbPa2pubmpuXvj8842NjZ1dXTIfigWAU0/9yut/f62jo/PgQw556623Wlt35axcZ2fnr3/9a55/uQcARBFyBY8idF4wUE/wo5bdzMUkSjWEDjb0CoIzjNlCDgL8JpPZls/5RQATde0E0xhJ6GrXvc52BqREXxgjf+FAF+BWbLKL899nslUYnxoM/CQc6hHmO56/wvOTvr9h0yb1/FhKDqBr2s7mlngs9utf/8/YsWNvu+02AJg7d+7atWvVe0V4PoMigVARoLtz9nrG/hiLHmkaf3PcHiFWel4EYJvHXmBDusQWzgGgCONDDf0IXQ8jtMrzHs7kBoYpJ/9eibwv/Zs3w0++jXqYKEKzdG22aSYo3eL7Kxj/yHX3yvmMRSLVVVVCyk1btoRDocsvv3zx4sXLV6xQDtihaD+lx+j6Y7bdLeUkSkowWeX7+0b+4xhP0fVDDK0G4T4h3nHc5Z5n7zOq/x0E/pdouM6EAEYRMtMwJmtaEKMuzjdwvtHzd3GWE/KTLwLDOgHvlyII1VA6hpJxlJYTnJPwse+/73qthbeMfwF6xac++/827aWiYoBagqdo+kRdK8MIACURtDHeJkQX4z2MZaV0EPIO0L1IAwggFMO4lJBygqsorcQ4AiAAujjf7PnrGWsXu6fuP+Ub+g8APfzeexkFJsBIQuopHUlxBSFKrwAAAeAI6UrBATHVsxMBRkiXYCrfh5AMICNFFxetnO/kvIPz4SGG/30W3vdh//OUTx7bzys1IghFMYoACiJkYkR3984EH6QtZA5kRsiMFLl9++Ye4LL/qWf87yL0L+izaJgE/28Ad6+x/bcT+sSBymH//T/6P/o/+t+i/x/PvxV465OhDwAAAABJRU5ErkJggg==";

// ==================== MOCK DATA ====================
const MOCK_DATA = [
  { pilote: "Leclerc",    course: "Circuit de l'Aube",  temps: "01:23.456", date: "2026-05-10" },
  { pilote: "Verstappen", course: "Circuit de l'Aube",  temps: "01:21.789", date: "2026-05-10" },
  { pilote: "Hamilton",   course: "Circuit de l'Aube",  temps: "01:24.201", date: "2026-05-10" },
  { pilote: "Norris",     course: "Circuit de l'Aube",  temps: "01:22.934", date: "2026-05-10" },
  { pilote: "Sainz",      course: "Circuit de l'Aube",  temps: "01:25.678", date: "2026-05-10" },
  { pilote: "Leclerc",    course: "Baie du Dragon",     temps: "02:10.123", date: "2026-05-17" },
  { pilote: "Verstappen", course: "Baie du Dragon",     temps: "02:08.456", date: "2026-05-17" },
  { pilote: "Hamilton",   course: "Baie du Dragon",     temps: "02:09.789", date: "2026-05-17" },
  { pilote: "Norris",     course: "Baie du Dragon",     temps: "02:11.234", date: "2026-05-17" },
  { pilote: "Sainz",      course: "Baie du Dragon",     temps: "02:12.567", date: "2026-05-17" },
  { pilote: "Leclerc",    course: "Tunnel Alpin",       temps: "01:45.321", date: "2026-05-24" },
  { pilote: "Verstappen", course: "Tunnel Alpin",       temps: "01:46.987", date: "2026-05-24" },
  { pilote: "Hamilton",   course: "Tunnel Alpin",       temps: "01:44.567", date: "2026-05-24" },
  { pilote: "Norris",     course: "Tunnel Alpin",       temps: "01:47.234", date: "2026-05-24" },
  { pilote: "Sainz",      course: "Tunnel Alpin",       temps: "01:43.891", date: "2026-05-24" },
];

// ==================== CONSTANTS ====================
const F1_POINTS = [25, 18, 15, 10, 8];

const C = {
  bg:        "#09090E",
  card:      "#111118",
  row:       "#13131C",
  rowAlt:    "#181826",
  accent:    "#C41230",
  accentDim: "#6B0A1A",
  gold:      "#F5A623",
  text:      "#EEEEF5",
  soft:      "#6A6A80",
  border:    "#222230",
};

// ==================== UTILS ====================
function parseTime(str) {
  if (!str || typeof str !== "string") return Infinity;
  try {
    const dotIdx = str.lastIndexOf(".");
    const colIdx = str.indexOf(":");
    if (colIdx === -1) return Infinity;
    const min = parseInt(str.slice(0, colIdx), 10);
    const sec = parseInt(str.slice(colIdx + 1, dotIdx !== -1 ? dotIdx : undefined), 10);
    const ms  = dotIdx !== -1 ? parseInt(str.slice(dotIdx + 1).padEnd(3, "0"), 10) : 0;
    if (isNaN(min) || isNaN(sec) || isNaN(ms)) return Infinity;
    return min * 60000 + sec * 1000 + ms;
  } catch { return Infinity; }
}

function formatTime(ms) {
  if (!isFinite(ms)) return "--:--.---";
  const min  = Math.floor(ms / 60000);
  const sec  = Math.floor((ms % 60000) / 1000);
  const mil  = ms % 1000;
  return `${String(min).padStart(2,"0")}:${String(sec).padStart(2,"0")}.${String(mil).padStart(3,"0")}`;
}

function formatDelta(ms) {
  if (ms === 0) return "LEADER";
  const s   = Math.floor(ms / 1000);
  const mil = ms % 1000;
  return `+${s}.${String(mil).padStart(3,"0")}`;
}

// ==================== COMPUTE ====================
function courseRanking(data, course) {
  const rows   = data.filter(d => d.course === course);
  const sorted = [...rows].sort((a, b) => parseTime(a.temps) - parseTime(b.temps));
  const best   = parseTime(sorted[0]?.temps);
  return sorted.map((r, i) => ({
    ...r, rank: i + 1,
    ms:     parseTime(r.temps),
    delta:  parseTime(r.temps) - best,
    points: F1_POINTS[i] ?? 0,
  }));
}

function cumulativeRanking(data, pilots, courses) {
  return pilots.map(pilote => {
    const rows  = data.filter(d => d.pilote === pilote);
    const total = rows.reduce((s, r) => s + parseTime(r.temps), 0);
    const done  = courses.filter(c => rows.some(r => r.course === c)).length;
    return { pilote, totalMs: total, avgMs: done ? total / done : Infinity, done, of: courses.length };
  }).sort((a, b) => b.done - a.done || a.totalMs - b.totalMs);
}

function pointsRanking(data, pilots, courses) {
  const pts     = Object.fromEntries(pilots.map(p => [p, 0]));
  const details = Object.fromEntries(pilots.map(p => [p, {}]));
  courses.forEach(course => {
    courseRanking(data, course).forEach(r => {
      if (pts[r.pilote] !== undefined) {
        pts[r.pilote]          += r.points;
        details[r.pilote][course] = { rank: r.rank, pts: r.points };
      }
    });
  });
  return pilots
    .map(p => ({ pilote: p, points: pts[p], detail: details[p] }))
    .sort((a, b) => b.points - a.points);
}

// ==================== UI ATOMS ====================
const medal = ["🥇","🥈","🥉"];

function Rank({ n }) {
  if (n <= 3) return <span style={{ fontSize:"1rem" }}>{medal[n-1]}</span>;
  return <span style={{ color: C.soft, fontSize:"0.82rem", fontWeight:600 }}>P{n}</span>;
}

function Th({ children, right }) {
  return (
    <th style={{
      padding:"9px 14px", textAlign: right ? "right" : "left",
      fontSize:"0.68rem", fontWeight:700, letterSpacing:"0.1em",
      color: C.soft, textTransform:"uppercase",
      background: C.card, borderBottom:`1px solid ${C.border}`,
    }}>{children}</th>
  );
}

function Td({ children, right, center, mono, bold, dim, gold, accent }) {
  return (
    <td style={{
      padding:"11px 14px",
      textAlign: center ? "center" : right ? "right" : "left",
      fontFamily: mono ? "'Courier New', monospace" : "inherit",
      fontWeight: bold ? 600 : 400,
      fontSize:"0.875rem",
      color: gold ? C.gold : dim ? C.soft : accent ? "#FFFFFF" : C.text,
      borderBottom:`1px solid ${C.border}22`,
    }}>{children}</td>
  );
}

function Pill({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: active ? C.accent : "transparent",
      border: `1px solid ${active ? C.accent : C.border}`,
      color: active ? "#fff" : C.soft,
      padding:"6px 18px", borderRadius:20,
      cursor:"pointer", fontSize:"0.8rem", fontWeight: active ? 600 : 400,
      transition:"all 0.15s",
    }}>{children}</button>
  );
}

// ==================== TABLES ====================
function CourseTable({ ranking }) {
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead><tr>
          <Th>Pos</Th><Th>Pilote</Th>
          <Th right>Temps</Th><Th right>Écart</Th><Th right>Pts</Th>
        </tr></thead>
        <tbody>
          {ranking.map((r, i) => (
            <tr key={r.pilote} style={{ background: i%2===0 ? C.row : C.rowAlt }}>
              <Td center><Rank n={r.rank} /></Td>
              <Td bold gold={i===0}>{r.pilote}</Td>
              <Td right mono gold={i===0}>{r.temps}</Td>
              <Td right mono dim>{r.delta === 0 ? "–" : formatDelta(r.delta)}</Td>
              <Td right bold accent={r.points>0}>{r.points > 0 ? r.points : "–"}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CumulTable({ ranking }) {
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead><tr>
          <Th>Pos</Th><Th>Pilote</Th>
          <Th right>Temps total</Th><Th right>Moy / course</Th><Th right>Courses</Th>
        </tr></thead>
        <tbody>
          {ranking.map((r, i) => (
            <tr key={r.pilote} style={{ background: i%2===0 ? C.row : C.rowAlt }}>
              <Td center><Rank n={i+1} /></Td>
              <Td bold gold={i===0}>{r.pilote}{i===0 ? " 👑" : ""}</Td>
              <Td right mono gold={i===0}>{formatTime(r.totalMs)}</Td>
              <Td right mono dim>{formatTime(Math.round(r.avgMs))}</Td>
              <Td right dim>{r.done}/{r.of}</Td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ color:C.soft, fontSize:"0.7rem", margin:"10px 0 0" }}>
        * Pilotes ayant complété toutes les courses classés en priorité
      </p>
    </div>
  );
}

function PtsTable({ ranking, courses }) {
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead><tr>
          <Th>Pos</Th><Th>Pilote</Th><Th right>Points</Th>
          {courses.map(c => <Th key={c} right><span style={{fontSize:"0.65rem"}}>{c}</span></Th>)}
        </tr></thead>
        <tbody>
          {ranking.map((r, i) => (
            <tr key={r.pilote} style={{ background: i%2===0 ? C.row : C.rowAlt }}>
              <Td center><Rank n={i+1} /></Td>
              <Td bold gold={i===0}>{r.pilote}{i===0 ? " 👑" : ""}</Td>
              <Td right bold gold={i===0}>{r.points} pts</Td>
              {courses.map(c => {
                const d = r.detail[c];
                return (
                  <Td key={c} right dim>
                    {d
                      ? <span style={{ color: d.rank<=3 ? C.gold : C.soft }}>{d.pts}</span>
                      : <span style={{ color:"#2a2a3a" }}>–</span>}
                  </Td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ color:C.soft, fontSize:"0.7rem", margin:"10px 0 0" }}>
        Barème : 25 – 18 – 15 – 10 – 8 pts · Au-delà de la 5ème place : 0 pt
      </p>
    </div>
  );
}

// ==================== VIEWS ====================
function GlobalView({ sub, setSub, cumul, pts, courses }) {
  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        <Pill active={sub==="cumul"} onClick={()=>setSub("cumul")}>⏱ Temps cumulé</Pill>
        <Pill active={sub==="pts"}   onClick={()=>setSub("pts")}>🏆 Points</Pill>
      </div>
      {sub==="cumul"
        ? <CumulTable ranking={cumul} />
        : <PtsTable   ranking={pts}   courses={courses} />}
    </div>
  );
}

function CourseView({ course, data }) {
  const ranking = useMemo(() => courseRanking(data, course), [data, course]);
  const best    = ranking[0];
  return (
    <div>
      <div style={{
        display:"flex", justifyContent:"space-between", alignItems:"center",
        flexWrap:"wrap", gap:12, marginBottom:20,
        background: C.card, border:`1px solid ${C.border}`,
        borderRadius:10, padding:"14px 20px",
      }}>
        <div>
          <div style={{ color:C.soft, fontSize:"0.65rem", letterSpacing:"0.12em", marginBottom:4 }}>
            MEILLEUR TEMPS
          </div>
          <div style={{ fontFamily:"'Courier New',monospace", fontSize:"1.6rem", color:C.gold, fontWeight:700 }}>
            {best?.temps ?? "--:--.---"}
          </div>
          <div style={{ color:C.soft, fontSize:"0.8rem", marginTop:2 }}>{best?.pilote}</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ color:C.soft, fontSize:"0.65rem", letterSpacing:"0.12em", marginBottom:4 }}>PILOTES</div>
          <div style={{ fontSize:"1.6rem", fontWeight:700 }}>{ranking.length}</div>
        </div>
      </div>
      <CourseTable ranking={ranking} />
    </div>
  );
}

// ==================== SHEETS LOADER ====================
function SheetsLoader({ onLoad }) {
  const [url,  setUrl]  = useState("");
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState("");

  async function load() {
    if (!url.trim()) return;
    setBusy(true); setErr("");
    try {
      const m = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!m) throw new Error("URL invalide — copiez l'URL depuis la barre d'adresse de Sheets");
      const csv = await fetch(
        `https://docs.google.com/spreadsheets/d/${m[1]}/export?format=csv`
      );
      if (!csv.ok) throw new Error("Feuille inaccessible — vérifiez qu'elle est partagée en public (Lecteur)");
      const text = await csv.text();
      const [header, ...lines] = text.trim().split("\n");
      const keys = header.split(",").map(k => k.trim().replace(/"/g,"").toLowerCase());
      const rows = lines
        .map(l => Object.fromEntries(
          l.split(",").map((v,i) => [keys[i], v.trim().replace(/"/g,"")])
        ))
        .filter(r => r.pilote && r.course && r.temps);
      if (!rows.length) throw new Error("Aucune ligne valide — vérifiez les colonnes : pilote, course, temps, date");
      onLoad(rows);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div style={{ marginTop:12 }}>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        <input
          value={url} onChange={e => setUrl(e.target.value)}
          placeholder="https://docs.google.com/spreadsheets/d/…"
          style={{
            flex:1, minWidth:260, background:C.card,
            border:`1px solid ${C.border}`, borderRadius:6,
            padding:"7px 12px", color:C.text, fontSize:"0.8rem", outline:"none",
          }}
        />
        <button onClick={load} disabled={busy} style={{
          background: C.accent, border:"none", color:"#fff",
          padding:"7px 18px", borderRadius:6, cursor: busy ? "wait" : "pointer",
          fontSize:"0.8rem", fontWeight:600,
        }}>
          {busy ? "Chargement…" : "Charger"}
        </button>
      </div>
      {err && <p style={{ color:C.accent, fontSize:"0.75rem", margin:"6px 0 0" }}>⚠ {err}</p>}
      <p style={{ color:C.soft, fontSize:"0.7rem", margin:"8px 0 0" }}>
        Structure requise dans Sheets : colonnes <code style={{color:C.text}}>pilote</code>, <code style={{color:C.text}}>course</code>, <code style={{color:C.text}}>temps</code>, <code style={{color:C.text}}>date</code>
      </p>
    </div>
  );
}

// ==================== APP ====================
export default function App() {
  const [data,      setData]      = useState(MOCK_DATA);
  const [activeTab, setActiveTab] = useState("global");
  const [sub,       setSub]       = useState("cumul");
  const [showSheet, setShowSheet] = useState(false);
  const isMock = data === MOCK_DATA;

  useEffect(() => {
    const link = document.createElement("link");
    link.rel   = "stylesheet";
    link.href  = "https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&display=swap";
    document.head.appendChild(link);
  }, []);

  const courses = useMemo(() => [...new Set(data.map(d => d.course))], [data]);
  const pilots  = useMemo(() => [...new Set(data.map(d => d.pilote))], [data]);
  const cumul   = useMemo(() => cumulativeRanking(data, pilots, courses), [data, pilots, courses]);
  const pts     = useMemo(() => pointsRanking(data, pilots, courses),     [data, pilots, courses]);
  const champion = cumul[0]?.pilote;

  const tabs = ["global", ...courses];

  function handleLoad(rows) {
    setData(rows);
    setShowSheet(false);
    setActiveTab("global");
  }

  return (
    <div style={{ background:C.bg, minHeight:"100vh", fontFamily:"'Inter',system-ui,sans-serif", color:C.text }}>

      {/* ── HEADER ── */}
      <div style={{
        background:`linear-gradient(160deg, #0E0E16 0%, #110610 100%)`,
        borderBottom:`1px solid ${C.border}`,
        padding:"22px 20px 18px",
      }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
            <div>
              <div style={{ color:"#FFFFFF", fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.18em", marginBottom:5 }}>
                CLASSEMENT OFFICIEL
              </div>
              <h1 style={{
                margin:0, fontFamily:"'Rajdhani',sans-serif",
                fontSize:"2rem", fontWeight:700, letterSpacing:"0.03em", lineHeight:1, color:"#FFFFFF",
              }}>
                <span style={{display:"flex",alignItems:"center",gap:10}}><img src={LOGO} alt="AIIMCR" style={{width:48,height:48,borderRadius:"50%",objectFit:"cover"}}/> Leaderboard</span>
              </h1>
            </div>

            {champion && (
              <div style={{
                background:`linear-gradient(135deg, ${C.accentDim}55, #1a100222)`,
                border:`1px solid ${C.gold}33`,
                borderRadius:8, padding:"8px 18px", textAlign:"center",
              }}>
                <div style={{ color:C.gold, fontSize:"0.62rem", letterSpacing:"0.15em", fontWeight:700, marginBottom:3 }}>
                  🏆 CHAMPION
                </div>
                <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:"1.4rem", fontWeight:700, color:C.gold }}>
                  {champion}
                </div>
              </div>
            )}
          </div>

          {/* Sheets toggle */}
          <div style={{ marginTop:14 }}>
            <button onClick={() => setShowSheet(v => !v)} style={{
              background:"transparent", border:`1px solid ${C.border}`,
              color:C.soft, padding:"5px 12px", borderRadius:6,
              cursor:"pointer", fontSize:"0.75rem", display:"flex", alignItems:"center", gap:6,
            }}>
              📊 {isMock ? "Connecter Google Sheets" : "Changer de feuille"}
            </button>
            {showSheet && <SheetsLoader onLoad={handleLoad} />}
          </div>

          {isMock && (
            <p style={{ color:C.soft, fontSize:"0.7rem", margin:"8px 0 0" }}>
              ⚠ Données de démonstration — connectez votre Google Sheets pour charger les vraies données
            </p>
          )}
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ background:C.card, borderBottom:`1px solid ${C.border}`, overflowX:"auto" }}>
        <div style={{ maxWidth:900, margin:"0 auto", display:"flex" }}>
          {tabs.map(tab => {
            const active = activeTab === tab;
            return (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                background:"transparent", border:"none",
                borderBottom: active ? `2px solid ${C.accent}` : "2px solid transparent",
                color: active ? C.text : C.soft,
                padding:"12px 18px", cursor:"pointer",
                fontSize:"0.85rem", fontWeight: active ? 600 : 400,
                whiteSpace:"nowrap", transition:"color 0.15s",
              }}>
                {tab === "global" ? "🌍 Global" : tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth:900, margin:"0 auto", padding:"24px 16px" }}>
        {activeTab === "global"
          ? <GlobalView sub={sub} setSub={setSub} cumul={cumul} pts={pts} courses={courses} />
          : <CourseView course={activeTab} data={data} />
        }
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        textAlign:"center", padding:"14px", color:C.soft,
        fontSize:"0.7rem", borderTop:`1px solid ${C.border}`,
      }}>
        {isMock
          ? "Mode démonstration"
          : `${data.length} temps · ${courses.length} courses · ${pilots.length} pilotes`}
      </div>
    </div>
  );
}
