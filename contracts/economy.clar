;; Economy Contract

(define-fungible-token virtual-currency)

(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u403))

(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (ft-mint? virtual-currency amount recipient)
  )
)

(define-public (transfer (amount uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) ERR_NOT_AUTHORIZED)
    (ft-transfer? virtual-currency amount sender recipient)
  )
)

(define-read-only (get-balance (account principal))
  (ok (ft-get-balance virtual-currency account))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply virtual-currency))
)

