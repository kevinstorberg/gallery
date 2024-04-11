class AddCanvassIdToContent < ActiveRecord::Migration[7.1]
  def change
    add_reference :contents, :canvass, foreign_key: true
  end
end
