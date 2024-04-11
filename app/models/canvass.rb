class Canvass < ApplicationRecord

  belongs_to :user

  has_many :contents, dependent: :destroy
end