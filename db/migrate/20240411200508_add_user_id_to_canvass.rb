class AddUserIdToCanvass < ActiveRecord::Migration[7.1]
  def change
    add_reference :canvasses, :user, foreign_key: true
  end
end
