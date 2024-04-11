class AddNameToCanvass < ActiveRecord::Migration[7.1]
  def change
    add_column :canvasses, :name, :string
  end
end
